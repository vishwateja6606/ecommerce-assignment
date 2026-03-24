package com.ecommerce.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class UserProfileUpdateRequest {
    @Size(max = 100) public String fullName;
    @Size(max = 20)  public String phone;
    @Size(max = 200) public String imageUrl;
}
