package com.cartflow.order.client;

import com.cartflow.order.exception.InvalidOrderException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class ProductClient {

    private static final Logger log = LoggerFactory.getLogger(ProductClient.class);

    private final RestTemplate restTemplate;

    @Value("${product-service.url:http://localhost:8081}")
    private String productServiceUrl;

    public ProductClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void reduceStock(Long productId, Integer quantity) {
        log.info("Requesting stock reduction for productId: {}, quantity: {}", productId, quantity);
        String url = productServiceUrl + "/api/products/" + productId + "/reduce-stock?quantity=" + quantity;
        try {
            restTemplate.exchange(url, HttpMethod.PUT, HttpEntity.EMPTY, Void.class);
            log.info("Stock reduced successfully for productId: {}", productId);
        } catch (HttpClientErrorException.BadRequest e) {
            log.error("Insufficient stock for productId: {}. Response: {}", productId, e.getResponseBodyAsString());
            throw new InvalidOrderException("Insufficient stock available for requested product (ID: " + productId + ")");
        } catch (Exception e) {
            log.error("Failed to reduce stock for productId: {}. Error: {}", productId, e.getMessage());
            throw new InvalidOrderException("Stock management service error for product ID: " + productId);
        }
    }

    public void restoreStock(Long productId, Integer quantity) {
        log.info("Requesting stock restoration for productId: {}, quantity: {}", productId, quantity);
        String url = productServiceUrl + "/api/products/" + productId + "/restore-stock?quantity=" + quantity;
        try {
            restTemplate.exchange(url, HttpMethod.PUT, HttpEntity.EMPTY, Void.class);
            log.info("Stock restored successfully for productId: {}", productId);
        } catch (Exception e) {
            log.error("Failed to restore stock for productId: {}. Error: {}", productId, e.getMessage());
        }
    }
}
