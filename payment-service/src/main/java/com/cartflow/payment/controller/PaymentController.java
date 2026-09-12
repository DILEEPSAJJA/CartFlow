package com.cartflow.payment.controller;

import com.cartflow.payment.dto.PaymentRequest;
import com.cartflow.payment.dto.PaymentResponse;
import com.cartflow.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment API", description = "REST APIs for processing payments and simulating circuit breaker failure scenarios")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @Operation(summary = "Process payment", description = "Simulate processing payment for an order and persist record")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest paymentRequest) {
        PaymentResponse response = paymentService.processPayment(paymentRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/toggle-failure")
    @Operation(summary = "Toggle failure simulation", description = "Enable or disable Payment Service failure simulation for testing Resilience4j Circuit Breaker")
    public ResponseEntity<Map<String, Object>> toggleFailureSimulation() {
        boolean active = paymentService.toggleFailureSimulation();
        return ResponseEntity.ok(Map.of(
                "failureSimulationActive", active,
                "message", active ? "Payment Service failure simulation ENABLED" : "Payment Service failure simulation DISABLED"
        ));
    }

    @GetMapping("/status-simulation")
    @Operation(summary = "Get failure simulation status", description = "Check if Payment Service failure simulation is currently active")
    public ResponseEntity<Map<String, Object>> getFailureSimulationStatus() {
        boolean active = paymentService.isFailureSimulationActive();
        return ResponseEntity.ok(Map.of("failureSimulationActive", active));
    }
}
