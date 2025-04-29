package com.artcafe.security.services;

import com.artcafe.model.LearningPlan;
import com.artcafe.model.PlanTopic;
import com.artcafe.model.User;
import com.artcafe.repository.LearningPlanRepository;
import com.artcafe.repository.PlanTopicRepository;
import com.artcafe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    private final LearningPlanRepository learningPlanRepository;
    private final PlanTopicRepository planTopicRepository;
    private final UserRepository userRepository;

    public LearningPlan createPlan(String userId, LearningPlan plan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        plan.setCreatedBy(user);
        plan.setCreatedById(userId);

        // First save the learning plan
        LearningPlan savedPlan = learningPlanRepository.save(plan);
        
        // Then update and save each topic with the plan ID
        if (plan.getTopics() != null) {
            for (PlanTopic topic : plan.getTopics()) {
                topic.setLearningPlanId(savedPlan.getId());
                planTopicRepository.save(topic);
            }
        }
        
        return savedPlan;
    }

    public List<LearningPlan> getPlansByUser(String userId) {
        return learningPlanRepository.findByCreatedById(userId);
    }

    public LearningPlan updatePlan(String planId, LearningPlan updatedPlan) {
        LearningPlan existingPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        existingPlan.setTitle(updatedPlan.getTitle());
        existingPlan.setDescription(updatedPlan.getDescription());
        existingPlan.setTargetCompletionDate(updatedPlan.getTargetCompletionDate());
        return learningPlanRepository.save(existingPlan);
    }

    public void deletePlan(String planId) {
        // First delete all topics associated with this plan
        List<PlanTopic> topics = planTopicRepository.findByLearningPlanId(planId);
        planTopicRepository.deleteAll(topics);
        
        // Then delete the plan
        learningPlanRepository.deleteById(planId);
    }

    public PlanTopic markTopicCompleted(String topicId) {
        PlanTopic topic = planTopicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        topic.setCompleted(true);
        return planTopicRepository.save(topic);
    }
}

