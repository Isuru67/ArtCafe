package com.artcafe.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "plan_topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanTopic {
    @Id
    private String id;

    private String topicName;
    private boolean completed;
    
    private String learningPlanId;
}

