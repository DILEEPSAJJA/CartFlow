package com.cartflow.order.event;

import java.math.BigDecimal;

public class OrderConfirmedEvent {

    private Long orderId;
    private Long customerId;
    private BigDecimal totalAmount;

    public OrderConfirmedEvent() {
    }

    public OrderConfirmedEvent(Long orderId, Long customerId, BigDecimal totalAmount) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.totalAmount = totalAmount;
    }

    public static OrderConfirmedEventBuilder builder() {
        return new OrderConfirmedEventBuilder();
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public static class OrderConfirmedEventBuilder {
        private Long orderId;
        private Long customerId;
        private BigDecimal totalAmount;

        OrderConfirmedEventBuilder() {
        }

        public OrderConfirmedEventBuilder orderId(Long orderId) {
            this.orderId = orderId;
            return this;
        }

        public OrderConfirmedEventBuilder customerId(Long customerId) {
            this.customerId = customerId;
            return this;
        }

        public OrderConfirmedEventBuilder totalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
            return this;
        }

        public OrderConfirmedEvent build() {
            return new OrderConfirmedEvent(orderId, customerId, totalAmount);
        }
    }
}
