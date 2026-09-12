package com.cartflow.order.dto;

import java.math.BigDecimal;

public class OrderItemResponse {

    private Long id;
    private Long productId;
    private Integer quantity;
    private BigDecimal price;

    public OrderItemResponse() {
    }

    public OrderItemResponse(Long id, Long productId, Integer quantity, BigDecimal price) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }

    public static OrderItemResponseBuilder builder() {
        return new OrderItemResponseBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public static class OrderItemResponseBuilder {
        private Long id;
        private Long productId;
        private Integer quantity;
        private BigDecimal price;

        OrderItemResponseBuilder() {
        }

        public OrderItemResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public OrderItemResponseBuilder productId(Long productId) {
            this.productId = productId;
            return this;
        }

        public OrderItemResponseBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public OrderItemResponseBuilder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public OrderItemResponse build() {
            return new OrderItemResponse(id, productId, quantity, price);
        }
    }
}
