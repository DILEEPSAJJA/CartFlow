package com.cartflow.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class OrderRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;

    public OrderRequest() {
    }

    public OrderRequest(Long customerId, List<OrderItemRequest> items) {
        this.customerId = customerId;
        this.items = items;
    }

    public static OrderRequestBuilder builder() {
        return new OrderRequestBuilder();
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public static class OrderRequestBuilder {
        private Long customerId;
        private List<OrderItemRequest> items;

        OrderRequestBuilder() {
        }

        public OrderRequestBuilder customerId(Long customerId) {
            this.customerId = customerId;
            return this;
        }

        public OrderRequestBuilder items(List<OrderItemRequest> items) {
            this.items = items;
            return this;
        }

        public OrderRequest build() {
            return new OrderRequest(customerId, items);
        }
    }
}
