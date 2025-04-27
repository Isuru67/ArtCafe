package com.artcafe.repository;

import com.artcafe.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    Page<Comment> findByPostIdOrderByCreatedAtDesc(String postId, Pageable pageable);
    List<Comment> findByPostId(String postId);
    long countByPostId(String postId);
}
