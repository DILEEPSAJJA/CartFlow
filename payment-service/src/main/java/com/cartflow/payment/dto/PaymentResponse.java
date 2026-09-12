package com.cartflow.payment.dto;

public class PaymentResponse {

    private Long orderId;
    private String status;

    public PaymentResponse() {
    }

    public PaymentResponse(Long orderId, String status) {
        this.orderId = orderId;
        this.status = status;
    }

    public static PaymentResponseBuilder builder() {
        return new PaymentResponseBuilder();
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public static class PaymentResponseBuilder {
        private Long orderId;
        private String status;

        PaymentResponseBuilder() {
        }

        public PaymentResponseBuilder orderId(Long orderId) {
            this.orderId = orderId;
            return this;
        }

        public PaymentResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public PaymentResponse build() {
            return new PaymentResponse(orderId, status);
        }
    }
}
