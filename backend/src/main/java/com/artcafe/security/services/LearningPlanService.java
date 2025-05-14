package com.artcafe.security.services;

import com.artcafe.model.LearningPlan;
import com.artcafe.model.PlanTopic;
import com.artcafe.model.User;
import com.artcafe.repository.LearningPlanRepository;
import com.artcafe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningPlanService {
    

    private final LearningPlanRepository learningPlanRepository;
    private final UserRepository userRepository;

    // Create a plan for a user
    public LearningPlan createLearningPlan(String userId, LearningPlan newPlan) {
        newPlan.setCreatedBy(userId);
        
        if (newPlan.getTopics() != null) {
            List<PlanTopic> formattedTopics = newPlan.getTopics().stream()
                .map(topic -> PlanTopic.builder()
                    .id(UUID.randomUUID().toString())
                    .topicName(topic.getTopicName())
                    .completed(false)
                    .build())
                .collect(Collectors.toList());
            newPlan.setTopics(formattedTopics);
        }
        
        return learningPlanRepository.save(newPlan);
    }

    // Get all plans by userId
    public List<LearningPlan> getPlansByUser(String userId) {
        return learningPlanRepository.findByCreatedBy(userId);
    }

    // Update a plan by planId
    public LearningPlan updatePlan(String planId, LearningPlan updatedPlan) {
        LearningPlan existingPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        existingPlan.setTitle(updatedPlan.getTitle());
        existingPlan.setDescription(updatedPlan.getDescription());
        existingPlan.setTargetCompletionDate(updatedPlan.getTargetCompletionDate());
        existingPlan.setTopics(updatedPlan.getTopics()); // Topics can also be updated
        return learningPlanRepository.save(existingPlan);

        
        
    }

    // Delete a plan by ID
    public void deletePlan(String planId) {
        learningPlanRepository.deleteById(planId);
    }

    // Mark a topic completed
    public LearningPlan markTopicCompleted(String topicId, String userId) {
        List<LearningPlan> allPlans = learningPlanRepository.findAll();

        for (LearningPlan plan : allPlans) {
            for (PlanTopic topic : plan.getTopics()) {
                if (topic.getId().equals(topicId)) {
                    topic.setCompleted(true);
                    return learningPlanRepository.save(plan);
                }
            }
        }
        throw new RuntimeException("Topic not found");
    }

    public LearningPlan getPlanById(String planId) {
        return learningPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("Plan not found"));
    }
    
}
