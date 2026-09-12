package com.cartflow.payment.controller;

import com.cartflow.payment.dto.PaymentRequest;
import com.cartflow.payment.dto.PaymentResponse;
import com.cartflow.payment.exception.GlobalExceptionHandler;
import com.cartflow.payment.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@Import(GlobalExceptionHandler.class)
@ActiveProfiles("test")
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @Autowired
    private ObjectMapper objectMapper;

    private PaymentResponse paymentResponse;
    private PaymentRequest paymentRequest;

    @BeforeEach
    void setUp() {
        paymentResponse = PaymentResponse.builder()
                .orderId(1001L)
                .status("SUCCESS")
                .build();

        paymentRequest = PaymentRequest.builder()
                .orderId(1001L)
                .amount(new BigDecimal("250.00"))
                .build();
    }

    @Test
    @DisplayName("POST /api/payments should return 200 OK")
    void processPayment_Success() throws Exception {
        when(paymentService.processPayment(any(PaymentRequest.class))).thenReturn(paymentResponse);

        mockMvc.perform(post("/api/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(1001))
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("POST /api/payments/toggle-failure should toggle simulation mode")
    void toggleFailureSimulation_Success() throws Exception {
        when(paymentService.toggleFailureSimulation()).thenReturn(true);

        mockMvc.perform(post("/api/payments/toggle-failure"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.failureSimulationActive").value(true));
    }

    @Test
    @DisplayName("GET /api/payments/status-simulation should return simulation status")
    void getFailureSimulationStatus_Success() throws Exception {
        when(paymentService.isFailureSimulationActive()).thenReturn(false);

        mockMvc.perform(get("/api/payments/status-simulation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.failureSimulationActive").value(false));
    }
}
