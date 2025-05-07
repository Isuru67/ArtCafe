package com.artcafe.repository;

import com.artcafe.model.LearningPlan;
import com.artcafe.model.User;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    List<LearningPlan> findByCreatedBy(String userId);  // Corrected for userId being a String

    Optional<LearningPlan> findById(String planId);  // Corrected planId to String, as MongoDB uses ObjectId (String)
}
