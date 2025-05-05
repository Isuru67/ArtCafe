package com.artcafe.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanTopic {
    private String id; // You can generate this using UUID
    private String topicName;
    private boolean completed;
}
