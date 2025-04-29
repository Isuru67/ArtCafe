package com.artcafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanDto {
    private String id;
    private String title;
    private String description;
    private LocalDate targetCompletionDate;
    private String createdBy; // store User ID or Username
    private List<PlanTopicDto> topics; // Nested DTO for topics
}
