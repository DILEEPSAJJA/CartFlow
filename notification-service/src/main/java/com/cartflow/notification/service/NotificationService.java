package com.cartflow.notification.service;

import com.cartflow.notification.dto.OrderConfirmedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    public void processOrderConfirmationNotification(OrderConfirmedEvent event) {
        log.info("Processing order confirmation event for Order #{}", event.getOrderId());
        log.info("Order confirmation notification sent for Order #{}", event.getOrderId());
        log.info("Notification Details -> Customer ID: {}, Total Amount: ${}", event.getCustomerId(), event.getTotalAmount());
    }
}
