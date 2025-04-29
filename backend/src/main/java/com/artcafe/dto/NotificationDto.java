package com.artcafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private String id;
    private String content;
    private String link;
    private boolean read;
    private LocalDateTime createdAt;
    private UserDto sender;
    private String type;
    private String referenceId;
}
