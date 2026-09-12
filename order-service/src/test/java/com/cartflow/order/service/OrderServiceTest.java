package com.cartflow.order.service;

import com.cartflow.order.client.PaymentClient;
import com.cartflow.order.dto.OrderItemRequest;
import com.cartflow.order.dto.OrderRequest;
import com.cartflow.order.dto.OrderResponse;
import com.cartflow.order.entity.Order;
import com.cartflow.order.entity.OrderItem;
import com.cartflow.order.entity.OrderStatus;
import com.cartflow.order.exception.InvalidOrderException;
import com.cartflow.order.exception.ResourceNotFoundException;
import com.cartflow.order.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentClient paymentClient;

    @Mock
    private com.cartflow.order.client.ProductClient productClient;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private OrderService orderService;

    private Order order;
    private OrderRequest orderRequest;

    @BeforeEach
    void setUp() {
        OrderItem item = OrderItem.builder()
                .id(1L)
                .productId(101L)
                .quantity(2)
                .price(new BigDecimal("150.00"))
                .build();

        order = Order.builder()
                .id(1L)
                .customerId(10L)
                .totalAmount(new BigDecimal("300.00"))
                .status(OrderStatus.CONFIRMED)
                .items(List.of(item))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        OrderItemRequest itemRequest = OrderItemRequest.builder()
                .productId(101L)
                .quantity(2)
                .price(new BigDecimal("150.00"))
                .build();

        orderRequest = OrderRequest.builder()
                .customerId(10L)
                .items(List.of(itemRequest))
                .build();
    }

    @Test
    @DisplayName("Should create order successfully when payment succeeds")
    void createOrder_PaymentSuccess() {
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        when(paymentClient.processPayment(any(), any())).thenReturn("SUCCESS");

        OrderResponse response = orderService.createOrder(orderRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(OrderStatus.CONFIRMED, response.getStatus());
        verify(kafkaTemplate, times(1)).send(eq("order-confirmed"), any(), any());
    }

    @Test
    @DisplayName("Should create order with PAYMENT_SERVICE_UNAVAILABLE when payment client falls back")
    void createOrder_PaymentUnavailable() {
        Order fallbackOrder = Order.builder()
                .id(1L)
                .customerId(10L)
                .totalAmount(new BigDecimal("300.00"))
                .status(OrderStatus.PAYMENT_SERVICE_UNAVAILABLE)
                .items(order.getItems())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(orderRepository.save(any(Order.class))).thenReturn(fallbackOrder);
        when(paymentClient.processPayment(any(), any())).thenReturn("PAYMENT_SERVICE_UNAVAILABLE");

        OrderResponse response = orderService.createOrder(orderRequest);

        assertNotNull(response);
        assertEquals(OrderStatus.PAYMENT_SERVICE_UNAVAILABLE, response.getStatus());
    }

    @Test
    @DisplayName("Should throw InvalidOrderException when items list is empty")
    void createOrder_EmptyItems() {
        OrderRequest emptyRequest = OrderRequest.builder()
                .customerId(10L)
                .items(List.of())
                .build();

        assertThrows(InvalidOrderException.class, () -> orderService.createOrder(emptyRequest));
    }

    @Test
    @DisplayName("Should return order by ID when found")
    void getOrderById_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrderById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when order ID is missing")
    void getOrderById_NotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderById(99L));
    }

    @Test
    @DisplayName("Should cancel order successfully")
    void cancelOrder_Success() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.cancelOrder(1L, "Changed mind");

        assertNotNull(response);
        assertEquals(OrderStatus.CANCELLED, response.getStatus());
    }
}
