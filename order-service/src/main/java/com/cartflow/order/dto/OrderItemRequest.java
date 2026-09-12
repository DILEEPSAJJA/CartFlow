package com.cartflow.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class OrderItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private Integer quantity;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    private BigDecimal price;

    public OrderItemRequest() {
    }

    public OrderItemRequest(Long productId, Integer quantity, BigDecimal price) {
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }

    public static OrderItemRequestBuilder builder() {
        return new OrderItemRequestBuilder();
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public static class OrderItemRequestBuilder {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;

        OrderItemRequestBuilder() {
        }

        public OrderItemRequestBuilder productId(Long productId) {
            this.productId = productId;
            return this;
        }

        public OrderItemRequestBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public OrderItemRequestBuilder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public OrderItemRequest build() {
            return new OrderItemRequest(productId, quantity, price);
        }
    }
}
