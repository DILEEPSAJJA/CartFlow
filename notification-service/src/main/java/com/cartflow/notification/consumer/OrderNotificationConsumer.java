package com.cartflow.notification.consumer;

import com.cartflow.notification.dto.OrderConfirmedEvent;
import com.cartflow.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderNotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderNotificationConsumer.class);

    private final NotificationService notificationService;

    public OrderNotificationConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "order-confirmed", groupId = "notification-group")
    public void consumeOrderConfirmedEvent(OrderConfirmedEvent event) {
        log.info("Received OrderConfirmedEvent from Kafka: orderId={}, customerId={}", event.getOrderId(), event.getCustomerId());
        notificationService.processOrderConfirmationNotification(event);
    }
}
