package com.cartflow.payment.service;

import com.cartflow.payment.dto.PaymentRequest;
import com.cartflow.payment.dto.PaymentResponse;
import com.cartflow.payment.entity.Payment;
import com.cartflow.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Payment payment;
    private PaymentRequest paymentRequest;

    @BeforeEach
    void setUp() {
        payment = Payment.builder()
                .id(1L)
                .orderId(1001L)
                .amount(new BigDecimal("250.00"))
                .status("SUCCESS")
                .createdAt(LocalDateTime.now())
                .build();

        paymentRequest = PaymentRequest.builder()
                .orderId(1001L)
                .amount(new BigDecimal("250.00"))
                .build();
    }

    @Test
    @DisplayName("Should process payment successfully")
    void processPayment_Success() {
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

        PaymentResponse response = paymentService.processPayment(paymentRequest);

        assertNotNull(response);
        assertEquals(1001L, response.getOrderId());
        assertEquals("SUCCESS", response.getStatus());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should toggle failure simulation mode and throw exception when active")
    void processPayment_FailureSimulation() {
        assertFalse(paymentService.isFailureSimulationActive());

        boolean active = paymentService.toggleFailureSimulation();
        assertTrue(active);
        assertTrue(paymentService.isFailureSimulationActive());

        assertThrows(RuntimeException.class, () -> paymentService.processPayment(paymentRequest));

        // Reset toggle
        paymentService.toggleFailureSimulation();
        assertFalse(paymentService.isFailureSimulationActive());
    }
}
