package com.cartflow.user.dto;

import com.cartflow.user.entity.Role;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String phoneNumber;
    private Role role;
    private String profileImage;
    private java.util.List<com.cartflow.user.entity.UserAddress> addresses;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String username, String email, String phoneNumber, Role role, String profileImage, java.util.List<com.cartflow.user.entity.UserAddress> addresses, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.profileImage = profileImage;
        this.addresses = addresses;
        this.createdAt = createdAt;
    }

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public java.util.List<com.cartflow.user.entity.UserAddress> getAddresses() {
        return addresses;
    }

    public void setAddresses(java.util.List<com.cartflow.user.entity.UserAddress> addresses) {
        this.addresses = addresses;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static class UserResponseBuilder {
        private Long id;
        private String username;
        private String email;
        private String phoneNumber;
        private Role role;
        private String profileImage;
        private java.util.List<com.cartflow.user.entity.UserAddress> addresses;
        private LocalDateTime createdAt;

        UserResponseBuilder() {
        }

        public UserResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserResponseBuilder phoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
            return this;
        }

        public UserResponseBuilder role(Role role) {
            this.role = role;
            return this;
        }

        public UserResponseBuilder profileImage(String profileImage) {
            this.profileImage = profileImage;
            return this;
        }

        public UserResponseBuilder addresses(java.util.List<com.cartflow.user.entity.UserAddress> addresses) {
            this.addresses = addresses;
            return this;
        }

        public UserResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserResponse build() {
            return new UserResponse(id, username, email, phoneNumber, role, profileImage, addresses, createdAt);
        }
    }
}
