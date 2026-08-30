package com.jannirikshan.complaint;

import com.jannirikshan.common.enums.Priority;
import jakarta.validation.constraints.*;

public record ComplaintRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 255)
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 10000)
        String description,

        @Size(max = 100)
        String category,

        String subcategory,
        String problemType,
        Priority severity,

        @Min(1)
        Integer affectedPeople,

        String expectedImpact,
        String desiredEngineeringOutcome,
        String contactInfo,
        Priority priority,

        @NotNull(message = "Latitude is required")
        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        Double latitude,

        @NotNull(message = "Longitude is required")
        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        Double longitude,

        @Size(max = 500)
        String address,

        String villageCity,
        String block,
        String district,
        String state,

        String citizenSuggestedCategory
) {}

