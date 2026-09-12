package com.cartflow.user.service;

import com.cartflow.user.dto.AuthResponse;
import com.cartflow.user.dto.LoginRequest;
import com.cartflow.user.dto.RegisterRequest;
import com.cartflow.user.dto.UserResponse;
import com.cartflow.user.entity.Role;
import com.cartflow.user.entity.User;
import com.cartflow.user.exception.InvalidCredentialsException;
import com.cartflow.user.exception.ResourceNotFoundException;
import com.cartflow.user.exception.UserAlreadyExistsException;
import com.cartflow.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public AuthResponse registerCustomer(RegisterRequest request) {
        log.info("Registering customer with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email '" + request.getEmail() + "' is already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username '" + request.getUsername() + "' is already taken");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new UserAlreadyExistsException("Phone number '" + request.getPhoneNumber() + "' is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.CUSTOMER)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Customer registered successfully with id: {}", savedUser.getId());

        return AuthResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phoneNumber(savedUser.getPhoneNumber())
                .role(savedUser.getRole())
                .profileImage(savedUser.getProfileImage())
                .addresses(savedUser.getAddresses())
                .message("Customer registered successfully")
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login for: {}", request.getEmail());

        User user = userRepository.findByEmailOrUsername(request.getEmail(), request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email/username or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new InvalidCredentialsException("Invalid email/username or password");
        }

        log.info("User logged in successfully with id: {}, role: {}", user.getId(), user.getRole());

        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .addresses(user.getAddresses())
                .message("Login successful")
                .build();
    }

    @Transactional
    public UserResponse updateUserProfile(Long userId, String username, String profileImage) {
        log.info("Updating user profile for userId: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (username != null && !username.trim().isEmpty()) {
            user.setUsername(username.trim());
        }
        if (profileImage != null) {
            user.setProfileImage(profileImage);
        }

        User updated = userRepository.save(user);
        log.info("Profile updated for userId: {}", userId);
        return mapToUserResponse(updated);
    }

    @Transactional
    public UserResponse addAddress(Long userId, com.cartflow.user.entity.UserAddress address) {
        log.info("Adding address for userId: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getAddresses().size() >= 5) {
            throw new IllegalArgumentException("Maximum limit of 5 saved addresses reached. Cannot add more than 5 addresses.");
        }

        user.getAddresses().add(address);
        User updated = userRepository.save(user);
        log.info("Address added for userId: {}. Total addresses: {}", userId, updated.getAddresses().size());
        return mapToUserResponse(updated);
    }

    @Transactional
    public UserResponse removeAddress(Long userId, int index) {
        log.info("Removing address index {} for userId: {}", index, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (index >= 0 && index < user.getAddresses().size()) {
            user.getAddresses().remove(index);
        } else {
            throw new IllegalArgumentException("Invalid address index: " + index);
        }

        User updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    @Transactional
    public void createInitialAdminIfAbsent(String email, String password, String username, String phoneNumber) {
        if (!userRepository.existsByEmail(email)) {
            log.info("Seeding initial admin account for email: {}", email);
            User admin = User.builder()
                    .email(email)
                    .password(password)
                    .username(username)
                    .phoneNumber(phoneNumber)
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Initial admin account created successfully.");
        } else {
            log.info("Admin account already exists for email: {}", email);
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .addresses(user.getAddresses())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
