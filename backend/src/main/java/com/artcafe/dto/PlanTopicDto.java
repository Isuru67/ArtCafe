package com.artcafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanTopicDto {
    private String id;
    private String topicName;
    private boolean completed;
}
