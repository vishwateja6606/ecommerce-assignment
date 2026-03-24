package com.ecommerce.controller;

import com.ecommerce.dto.ChangePasswordRequest;
import com.ecommerce.dto.UserProfileUpdateRequest;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoints for user profile management.
 *
 * GET  /api/users/profile          – view own profile
 * PUT  /api/users/profile          – update own profile
 * PUT  /api/users/change-password  – change password
 * GET  /api/users                  – list all users (ADMIN only)
 * GET  /api/users/{id}             – get user by id (ADMIN only)
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Own Profile ───────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", principal.getUsername()));
        // Return a sanitized view (no password hash)
        return ResponseEntity.ok(Map.of(
                "id",       user.getId(),
                "username", user.getUsername(),
                "email",    user.getEmail(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "phone",    user.getPhone() != null ? user.getPhone() : "",
                "imageUrl", user.getImageUrl() != null ? user.getImageUrl() : "",
                "role",     user.getRole().name(),
                "provider", user.getProvider() != null ? user.getProvider() : "local"
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                           @Valid @RequestBody UserProfileUpdateRequest req) {
        User user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", principal.getUsername()));

        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getPhone()    != null) user.setPhone(req.getPhone());
        if (req.getImageUrl() != null) user.setImageUrl(req.getImageUrl());

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                            @Valid @RequestBody ChangePasswordRequest req) {
        User user = userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", principal.getUsername()));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // ── Admin: manage all users ───────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        var users = userRepository.findAll().stream().map(u -> Map.of(
                "id",       u.getId(),
                "username", u.getUsername(),
                "email",    u.getEmail(),
                "fullName", u.getFullName() != null ? u.getFullName() : "",
                "role",     u.getRole().name(),
                "provider", u.getProvider() != null ? u.getProvider() : "local"
        )).toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return ResponseEntity.ok(Map.of(
                "id",       user.getId(),
                "username", user.getUsername(),
                "email",    user.getEmail(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "role",     user.getRole().name()
        ));
    }
}
