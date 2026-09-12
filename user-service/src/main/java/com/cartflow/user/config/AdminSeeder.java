package com.cartflow.user.config;

import com.cartflow.user.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserService userService;

    public AdminSeeder(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(String... args) {
        // Create initial admin credentials specified in requirement:
        // email: admin@cartflow.com, password: admin@123
        userService.createInitialAdminIfAbsent(
                "admin@cartflow.com",
                "admin@123",
                "admin",
                "+10000000000"
        );
    }
}
