package com.artcafe.repository;

import com.artcafe.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {
    Optional<Like> findByPostIdAndUserId(String postId, String userId);
    boolean existsByPostIdAndUserId(String postId, String userId);
    long countByPostId(String postId);
    void deleteByPostIdAndUserId(String postId, String userId);
}
