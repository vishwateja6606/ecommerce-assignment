package com.ecommerce.config;

import com.ecommerce.model.Product;
import com.ecommerce.model.Role;
import com.ecommerce.model.User;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds the database with two default users (admin / user) and sample products.
 * Runs automatically on application startup.
 *
 *  admin  / Admin@123  → ROLE_ADMIN (full CRUD on products)
 *  user   / User@123   → ROLE_USER  (read-only)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedProducts();
    }

    private void seedUsers() {
        if (userRepository.existsByUsername("admin")) return;

        User admin = User.builder()
                .username("admin")
                .email("admin@ecommerce.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("Admin User")
                .role(Role.ROLE_ADMIN)
                .build();

        User user = User.builder()
                .username("user")
                .email("user@ecommerce.com")
                .password(passwordEncoder.encode("User@123"))
                .fullName("Regular User")
                .role(Role.ROLE_USER)
                .build();

        userRepository.saveAll(List.of(admin, user));
        log.info("Seeded default users: admin / user");
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        List<Product> products = List.of(
            Product.builder().name("Apple iPhone 15 Pro").description("6.1-inch Super Retina XDR display, A17 Pro chip, 48MP camera system").price(new BigDecimal("1299.99")).stock(50).category("Electronics").imageUrl("https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400").build(),
            Product.builder().name("Samsung Galaxy S24 Ultra").description("6.8-inch Dynamic AMOLED, 200MP camera, built-in S Pen").price(new BigDecimal("1199.99")).stock(35).category("Electronics").imageUrl("https://images.unsplash.com/photo-1706220834658-09cf8ec0e8d7?w=400").build(),
            Product.builder().name("Sony WH-1000XM5 Headphones").description("Industry-leading noise cancellation, 30-hour battery life").price(new BigDecimal("349.99")).stock(80).category("Electronics").imageUrl("https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400").build(),
            Product.builder().name("Apple MacBook Air M3").description("13.6-inch Liquid Retina display, Apple M3 chip, 18-hour battery").price(new BigDecimal("1099.00")).stock(25).category("Laptops").imageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400").build(),
            Product.builder().name("Nike Air Max 270").description("Lightweight running shoes with Max Air heel unit").price(new BigDecimal("149.99")).stock(120).category("Footwear").imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400").build(),
            Product.builder().name("Levi's 501 Original Jeans").description("Classic straight-leg denim jeans, button fly").price(new BigDecimal("59.99")).stock(200).category("Clothing").imageUrl("https://images.unsplash.com/photo-1542272604-787c3835535d?w=400").build(),
            Product.builder().name("Instant Pot Duo 7-in-1").description("Electric pressure cooker, slow cooker, rice cooker, steamer, sauté, and warmer").price(new BigDecimal("79.99")).stock(65).category("Kitchen").imageUrl("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400").build(),
            Product.builder().name("The Pragmatic Programmer").description("Your Journey to Mastery – 20th Anniversary Edition").price(new BigDecimal("49.99")).stock(100).category("Books").imageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400").build(),
            Product.builder().name("Dyson V15 Detect").description("Cordless vacuum cleaner with laser dust detection").price(new BigDecimal("699.99")).stock(30).category("Home").imageUrl("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400").build(),
            Product.builder().name("LEGO Technic Bugatti Chiron").description("3599-piece model of the iconic hypercar").price(new BigDecimal("449.99")).stock(15).category("Toys").imageUrl("https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400").build()
        );

        productRepository.saveAll(products);
        log.info("Seeded {} sample products", products.size());
    }
}
