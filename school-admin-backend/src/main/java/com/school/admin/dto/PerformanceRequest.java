package com.school.admin.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PerformanceRequest {
    @NotNull(message = "Student is required")
    private Long studentId;

    @NotNull(message = "Subject is required")
    private Long subjectId;

    @NotBlank(message = "Exam type is required")
    private String examType;

    @NotNull(message = "Marks are required")
    @DecimalMin(value = "0.0", message = "Marks cannot be negative")
    private Double marks;

    @NotNull(message = "Max marks are required")
    @DecimalMin(value = "1.0", message = "Max marks must be at least 1")
    private Double maxMarks;

    private String term;
    private String academicYear;
    private String remarks;
}
