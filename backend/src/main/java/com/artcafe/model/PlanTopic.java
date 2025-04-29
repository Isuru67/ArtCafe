package com.artcafe.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlanTopic {
    private String id; // You can generate this using UUID
    private String topicName;
    private boolean completed;
}
