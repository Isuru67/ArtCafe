package com.artcafe.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "learning_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPlan {
    @Id
    private String id;

    private String title;

    private String description;

    private LocalDate targetCompletionDate;

    @DBRef
    private User createdBy; // Owner of the plan
    
    private String createdById;

    private List<PlanTopic> topics;
}
