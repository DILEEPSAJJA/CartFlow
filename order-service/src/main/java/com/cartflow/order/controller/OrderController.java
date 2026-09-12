package com.cartflow.order.controller;

import com.cartflow.order.dto.OrderRequest;
import com.cartflow.order.dto.OrderResponse;
import com.cartflow.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order API", description = "REST APIs for order placement, lookup, and order status updates")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @Operation(summary = "Create order", description = "Create a new order, process payment, and trigger confirmation event")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        OrderResponse createdOrder = orderService.createOrder(orderRequest);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all orders", description = "Retrieve a list of all orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieve detailed information for a specific order by ID")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get orders by customer ID", description = "Retrieve all orders placed by a specific customer")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel an existing order by ID with optional cancellation reason")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String reason) {
        return ResponseEntity.ok(orderService.cancelOrder(id, reason));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Update shipment tracking status for an order")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam com.cartflow.order.entity.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @PutMapping("/{id}/return")
    @Operation(summary = "Request return and refund", description = "Request return and refund for an order")
    public ResponseEntity<OrderResponse> requestReturn(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String reason) {
        return ResponseEntity.ok(orderService.requestReturn(id, reason));
    }
}
