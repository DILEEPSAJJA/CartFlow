package com.cartflow.payment.service;

import com.cartflow.payment.dto.PaymentRequest;
import com.cartflow.payment.dto.PaymentResponse;
import com.cartflow.payment.entity.Payment;
import com.cartflow.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final AtomicBoolean simulateFailure = new AtomicBoolean(false);

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest paymentRequest) {
        log.info("Processing payment request for orderId: {}, amount: {}", paymentRequest.getOrderId(), paymentRequest.getAmount());

        if (simulateFailure.get()) {
            log.warn("Failure simulation ACTIVE! Throwing exception to trigger Circuit Breaker for orderId: {}", paymentRequest.getOrderId());
            throw new RuntimeException("Simulated Payment Service outage for testing Resilience4j Circuit Breaker");
        }

        Payment payment = Payment.builder()
                .orderId(paymentRequest.getOrderId())
                .amount(paymentRequest.getAmount())
                .status("SUCCESS")
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment SUCCESS saved with id: {} for orderId: {}", savedPayment.getId(), savedPayment.getOrderId());

        return PaymentResponse.builder()
                .orderId(savedPayment.getOrderId())
                .status(savedPayment.getStatus())
                .build();
    }

    public boolean toggleFailureSimulation() {
        boolean newState = !simulateFailure.get();
        simulateFailure.set(newState);
        log.info("Payment Service failure simulation toggled. Active: {}", newState);
        return newState;
    }

    public boolean isFailureSimulationActive() {
        return simulateFailure.get();
    }
}
