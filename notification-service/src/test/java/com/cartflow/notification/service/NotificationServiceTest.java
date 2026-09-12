package com.cartflow.notification.service;

import com.cartflow.notification.dto.OrderConfirmedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class NotificationServiceTest {

    private NotificationService notificationService;
    private OrderConfirmedEvent event;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService();

        event = OrderConfirmedEvent.builder()
                .orderId(1001L)
                .customerId(10L)
                .totalAmount(new BigDecimal("650.00"))
                .build();
    }

    @Test
    @DisplayName("Should process order confirmation notification without throwing exceptions")
    void processNotification_Success() {
        assertDoesNotThrow(() -> notificationService.processOrderConfirmationNotification(event));
    }
}
