package com.ecommerce.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * User entity representing a registered account.
 * Supports both local (username/password) and OAuth2 (SSO) login flows.
 */
@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"),
                @UniqueConstraint(columnNames = "email")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank
    @Size(max = 100)
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    /** Hashed password – null for OAuth2-only accounts. */
    @Size(max = 120)
    private String password;

    /** Display / full name of the user. */
    @Size(max = 100)
    private String fullName;

    /** Phone number stored for profile management. */
    @Size(max = 20)
    private String phone;

    /** URL of profile picture (populated from OAuth2 provider). */
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /**
     * OAuth2 provider name (e.g., "google", "github", "facebook").
     * Null for local accounts.
     */
    private String provider;

    /** Subject ID returned by the OAuth2 provider. */
    private String providerId;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;
}
