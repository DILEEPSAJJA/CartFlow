package com.cartflow.order.service;

import com.cartflow.order.client.PaymentClient;
import com.cartflow.order.client.ProductClient;
import com.cartflow.order.dto.OrderItemRequest;
import com.cartflow.order.dto.OrderItemResponse;
import com.cartflow.order.dto.OrderRequest;
import com.cartflow.order.dto.OrderResponse;
import com.cartflow.order.entity.Order;
import com.cartflow.order.entity.OrderItem;
import com.cartflow.order.entity.OrderStatus;
import com.cartflow.order.event.OrderConfirmedEvent;
import com.cartflow.order.exception.InvalidOrderException;
import com.cartflow.order.exception.ResourceNotFoundException;
import com.cartflow.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private static final String TOPIC_ORDER_CONFIRMED = "order-confirmed";

    private final OrderRepository orderRepository;
    private final PaymentClient paymentClient;
    private final ProductClient productClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OrderService(OrderRepository orderRepository,
                        PaymentClient paymentClient,
                        ProductClient productClient,
                        KafkaTemplate<String, Object> kafkaTemplate) {
        this.orderRepository = orderRepository;
        this.paymentClient = paymentClient;
        this.productClient = productClient;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest) {
        log.info("Creating order for customerId: {}", orderRequest.getCustomerId());

        if (orderRequest.getItems() == null || orderRequest.getItems().isEmpty()) {
            throw new InvalidOrderException("Order must contain at least one item");
        }

        // Deduct stock for all items in Product Service
        for (OrderItemRequest itemReq : orderRequest.getItems()) {
            productClient.reduceStock(itemReq.getProductId(), itemReq.getQuantity());
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : orderRequest.getItems()) {
            BigDecimal itemTotal = itemReq.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        Order order = Order.builder()
                .customerId(orderRequest.getCustomerId())
                .totalAmount(totalAmount)
                .status(OrderStatus.PAYMENT_PENDING)
                .build();

        for (OrderItemRequest itemReq : orderRequest.getItems()) {
            OrderItem item = OrderItem.builder()
                    .productId(itemReq.getProductId())
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .build();
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);
        log.info("Order initialized with id: {}, status: PAYMENT_PENDING", savedOrder.getId());

        // Process synchronous payment via CircuitBreaker wrapped client
        String paymentStatus = paymentClient.processPayment(savedOrder.getId(), savedOrder.getTotalAmount());

        if ("SUCCESS".equalsIgnoreCase(paymentStatus)) {
            savedOrder.setStatus(OrderStatus.CONFIRMED);
            log.info("Payment SUCCESS for orderId: {}. Status updated to CONFIRMED.", savedOrder.getId());

            publishOrderConfirmedEvent(savedOrder);
        } else if ("PAYMENT_SERVICE_UNAVAILABLE".equalsIgnoreCase(paymentStatus)) {
            savedOrder.setStatus(OrderStatus.PAYMENT_SERVICE_UNAVAILABLE);
            log.warn("Payment service unavailable for orderId: {}. Status set to PAYMENT_SERVICE_UNAVAILABLE.", savedOrder.getId());
        } else {
            savedOrder.setStatus(OrderStatus.PAYMENT_FAILED);
            log.warn("Payment FAILED for orderId: {}. Status updated to PAYMENT_FAILED.", savedOrder.getId());
            // Restore stock if payment failed
            for (OrderItemRequest itemReq : orderRequest.getItems()) {
                productClient.restoreStock(itemReq.getProductId(), itemReq.getQuantity());
            }
        }

        Order finalOrder = orderRepository.save(savedOrder);
        return mapToOrderResponse(finalOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        log.info("Fetching order by id: {}", id);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        log.info("Fetching orders for customerId: {}", customerId);
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, String reason) {
        log.info("Cancelling order with id: {}, reason: {}", id, reason);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOrderException("Order is already cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            order.setCancellationReason(reason);
        }

        // Restore product stock upon order cancellation
        for (OrderItem item : order.getItems()) {
            productClient.restoreStock(item.getProductId(), item.getQuantity());
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order id {} successfully cancelled and stock restored", id);
        return mapToOrderResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        log.info("Updating status for order id {} to {}", id, status);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        order.setStatus(status);
        if (status == OrderStatus.REFUNDED) {
            for (OrderItem item : order.getItems()) {
                productClient.restoreStock(item.getProductId(), item.getQuantity());
            }
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToOrderResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse requestReturn(Long id, String reason) {
        log.info("Requesting return for order id {}, reason: {}", id, reason);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        if (reason != null && !reason.trim().isEmpty()) {
            order.setCancellationReason("Return: " + reason.trim());
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToOrderResponse(updatedOrder);
    }

    private void publishOrderConfirmedEvent(Order order) {
        try {
            OrderConfirmedEvent event = OrderConfirmedEvent.builder()
                    .orderId(order.getId())
                    .customerId(order.getCustomerId())
                    .totalAmount(order.getTotalAmount())
                    .build();

            log.info("Publishing OrderConfirmedEvent to Kafka topic '{}' for orderId: {}", TOPIC_ORDER_CONFIRMED, order.getId());
            kafkaTemplate.send(TOPIC_ORDER_CONFIRMED, String.valueOf(order.getId()), event);
        } catch (Exception e) {
            log.error("Failed to publish OrderConfirmedEvent for orderId: {}. Error: {}", order.getId(), e.getMessage());
        }
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .cancellationReason(order.getCancellationReason())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
