package com.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProductRequest {
    @NotBlank @Size(max = 200) public String name;
    @Size(max = 2000)          public String description;
    @NotNull @DecimalMin("0")  public BigDecimal price;
    @NotNull @Min(0)           public Integer stock;
    @Size(max = 100)           public String category;
    public String imageUrl;
}
