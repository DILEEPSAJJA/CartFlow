package com.cartflow.order.controller;

import com.cartflow.order.dto.OrderItemRequest;
import com.cartflow.order.dto.OrderItemResponse;
import com.cartflow.order.dto.OrderRequest;
import com.cartflow.order.dto.OrderResponse;
import com.cartflow.order.entity.OrderStatus;
import com.cartflow.order.exception.GlobalExceptionHandler;
import com.cartflow.order.exception.ResourceNotFoundException;
import com.cartflow.order.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@Import(GlobalExceptionHandler.class)
@ActiveProfiles("test")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    private OrderResponse orderResponse;
    private OrderRequest orderRequest;

    @BeforeEach
    void setUp() {
        OrderItemResponse itemResponse = OrderItemResponse.builder()
                .id(1L)
                .productId(101L)
                .quantity(2)
                .price(new BigDecimal("150.00"))
                .build();

        orderResponse = OrderResponse.builder()
                .id(1L)
                .customerId(10L)
                .totalAmount(new BigDecimal("300.00"))
                .status(OrderStatus.CONFIRMED)
                .items(List.of(itemResponse))
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
    @DisplayName("POST /api/orders should return 201 CREATED")
    void createOrder_Success() throws Exception {
        when(orderService.createOrder(any(OrderRequest.class))).thenReturn(orderResponse);

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @DisplayName("GET /api/orders/{id} should return 200 OK when found")
    void getOrderById_Success() throws Exception {
        when(orderService.getOrderById(1L)).thenReturn(orderResponse);

        mockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.customerId").value(10));
    }

    @Test
    @DisplayName("GET /api/orders/{id} should return 404 NOT FOUND when missing")
    void getOrderById_NotFound() throws Exception {
        when(orderService.getOrderById(99L)).thenThrow(new ResourceNotFoundException("Order not found with id: 99"));

        mockMvc.perform(get("/api/orders/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("PUT /api/orders/{id}/cancel should return 200 OK")
    void cancelOrder_Success() throws Exception {
        OrderResponse cancelledResponse = OrderResponse.builder()
                .id(1L)
                .customerId(10L)
                .totalAmount(new BigDecimal("300.00"))
                .status(OrderStatus.CANCELLED)
                .items(orderResponse.getItems())
                .createdAt(orderResponse.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        when(orderService.cancelOrder(eq(1L), any())).thenReturn(cancelledResponse);

        mockMvc.perform(put("/api/orders/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
