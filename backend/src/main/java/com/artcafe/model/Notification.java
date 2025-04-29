package com.artcafe.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    private String id;
    
    private String content;
    
    private String link;
    
    private boolean read = false;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private String recipientId;
    
    @DBRef
    private User sender;
    
    private String senderId;
    
    private String type; // LIKE, COMMENT, etc.
    
    private String referenceId; // ID of the post or comment referenced
}
