package com.ecommerce.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long   id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String imageUrl;

    public JwtResponse(String token, Long id, String username, String email,
                       String role, String fullName, String imageUrl) {
        this.token = token; this.id = id; this.username = username;
        this.email = email; this.role = role; this.fullName = fullName;
        this.imageUrl = imageUrl;
    }
}
