package com.cartflow.user.service;

import com.cartflow.user.dto.AuthResponse;
import com.cartflow.user.dto.LoginRequest;
import com.cartflow.user.dto.RegisterRequest;
import com.cartflow.user.entity.Role;
import com.cartflow.user.entity.User;
import com.cartflow.user.exception.InvalidCredentialsException;
import com.cartflow.user.exception.UserAlreadyExistsException;
import com.cartflow.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("john_doe")
                .email("john@example.com")
                .password("password123")
                .phoneNumber("+1234567890")
                .role(Role.CUSTOMER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        registerRequest = RegisterRequest.builder()
                .username("john_doe")
                .email("john@example.com")
                .password("password123")
                .phoneNumber("+1234567890")
                .build();

        loginRequest = LoginRequest.builder()
                .email("john@example.com")
                .password("password123")
                .build();
    }

    @Test
    @DisplayName("Should register customer successfully")
    void registerCustomer_Success() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("john_doe")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("+1234567890")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        AuthResponse response = userService.registerCustomer(registerRequest);

        assertNotNull(response);
        assertEquals("john_doe", response.getUsername());
        assertEquals(Role.CUSTOMER, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when email is taken")
    void registerCustomer_DuplicateEmail() {
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> userService.registerCustomer(registerRequest));
    }

    @Test
    @DisplayName("Should authenticate user login successfully")
    void login_Success() {
        when(userRepository.findByEmailOrUsername("john@example.com", "john@example.com"))
                .thenReturn(Optional.of(user));

        AuthResponse response = userService.login(loginRequest);

        assertNotNull(response);
        assertEquals("john_doe", response.getUsername());
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException when password does not match")
    void login_WrongPassword() {
        when(userRepository.findByEmailOrUsername("john@example.com", "john@example.com"))
                .thenReturn(Optional.of(user));

        LoginRequest wrongPasswordReq = LoginRequest.builder()
                .email("john@example.com")
                .password("wrongpwd")
                .build();

        assertThrows(InvalidCredentialsException.class, () -> userService.login(wrongPasswordReq));
    }
}
