package com.cartflow.user.controller;

import com.cartflow.user.dto.UserResponse;
import com.cartflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User API", description = "REST APIs for managing user profiles")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve list of all registered users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve user profile details by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}/profile")
    @Operation(summary = "Update user profile", description = "Update user username and profile photo URL. Email and Phone cannot be modified.")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body) {
        String username = body.get("username");
        String profileImage = body.get("profileImage");
        return ResponseEntity.ok(userService.updateUserProfile(id, username, profileImage));
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/addresses")
    @Operation(summary = "Add saved address", description = "Add a new saved address for the user (Max 5 addresses allowed)")
    public ResponseEntity<UserResponse> addAddress(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody com.cartflow.user.entity.UserAddress address) {
        return ResponseEntity.ok(userService.addAddress(id, address));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}/addresses/{index}")
    @Operation(summary = "Delete saved address", description = "Delete a saved address by index")
    public ResponseEntity<UserResponse> deleteAddress(
            @PathVariable Long id,
            @PathVariable int index) {
        return ResponseEntity.ok(userService.removeAddress(id, index));
    }
}
