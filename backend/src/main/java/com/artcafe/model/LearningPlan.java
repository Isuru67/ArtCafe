package com.artcafe.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "learningplans")
public class LearningPlan {

    @Id
    private String id;
    private String id;

    @Field("title")
    private String title;

    @Field("description")
    private String description;

    @Field("targetCompletionDate")
    private LocalDate targetCompletionDate;

    @Field("createdBy")
    private String createdBy;

    @Field("topics")
    private List<PlanTopic> topics;
}
