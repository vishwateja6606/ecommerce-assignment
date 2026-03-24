package com.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the E-Commerce backend application.
 * Provides REST APIs for authentication, product management, and user profiles.
 * Supports JWT-based auth and OAuth2 SSO (Google, GitHub, Facebook).
 */
@SpringBootApplication
public class EcommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }
}
