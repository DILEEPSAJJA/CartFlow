package com.cartflow.order.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class PaymentClient {

    private static final Logger log = LoggerFactory.getLogger(PaymentClient.class);

    private final RestTemplate restTemplate;

    @Value("${payment-service.url:http://localhost:8082}")
    private String paymentServiceUrl;

    public PaymentClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    public String processPayment(Long orderId, BigDecimal amount) {
        log.info("Sending payment request for orderId: {}, amount: {} to {}", orderId, amount, paymentServiceUrl);

        String url = paymentServiceUrl + "/api/payments";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("orderId", orderId);
        requestBody.put("amount", amount);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            String status = (String) response.getBody().get("status");
            log.info("Payment response received for orderId {}: {}", orderId, status);
            return status != null ? status : "FAILED";
        }

        log.warn("Payment request returned non-2xx status code or empty body for orderId: {}", orderId);
        return "FAILED";
    }

    public String paymentFallback(Long orderId, BigDecimal amount, Throwable throwable) {
        log.error("Circuit breaker fallback executed for orderId: {}. Reason: {}", orderId, throwable.getMessage());
        return "PAYMENT_SERVICE_UNAVAILABLE";
    }
}
