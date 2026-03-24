package com.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

// ─── Auth ─────────────────────────────────────────────────────────────────────

@Data @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {
    @NotBlank private String usernameOrEmail;
    @NotBlank private String password;
}
