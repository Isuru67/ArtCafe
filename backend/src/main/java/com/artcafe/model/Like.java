package com.artcafe.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "likes")
@CompoundIndex(name = "post_user_idx", def = "{'postId': 1, 'userId': 1}", unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Like {
    
    @Id
    private String id;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private String postId;
    
    @DBRef
    private User user;
    
    private String userId;
}
