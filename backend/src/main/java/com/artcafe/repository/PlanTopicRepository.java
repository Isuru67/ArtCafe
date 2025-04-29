package com.artcafe.repository;

import com.artcafe.model.PlanTopic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanTopicRepository extends MongoRepository<PlanTopic, String> {
    List<PlanTopic> findByLearningPlanId(String learningPlanId);
}
