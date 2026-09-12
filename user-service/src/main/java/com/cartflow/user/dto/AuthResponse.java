package com.cartflow.user.dto;

import com.cartflow.user.entity.Role;

public class AuthResponse {

    private Long id;
    private String username;
    private String email;
    private String phoneNumber;
    private Role role;
    private String profileImage;
    private java.util.List<com.cartflow.user.entity.UserAddress> addresses;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(Long id, String username, String email, String phoneNumber, Role role, String profileImage, java.util.List<com.cartflow.user.entity.UserAddress> addresses, String message) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.profileImage = profileImage;
        this.addresses = addresses;
        this.message = message;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public static class AuthResponseBuilder {
        private Long id;
        private String username;
        private String email;
        private String phoneNumber;
        private Role role;
        private String profileImage;
        private java.util.List<com.cartflow.user.entity.UserAddress> addresses;
        private String message;

        AuthResponseBuilder() {
        }

        public AuthResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public AuthResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public AuthResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public AuthResponseBuilder phoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
            return this;
        }

        public AuthResponseBuilder role(Role role) {
            this.role = role;
            return this;
        }

        public AuthResponseBuilder profileImage(String profileImage) {
            this.profileImage = profileImage;
            return this;
        }

        public AuthResponseBuilder addresses(java.util.List<com.cartflow.user.entity.UserAddress> addresses) {
            this.addresses = addresses;
            return this;
        }

        public AuthResponseBuilder message(String message) {
            this.message = message;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(id, username, email, phoneNumber, role, profileImage, addresses, message);
        }
    }
}
