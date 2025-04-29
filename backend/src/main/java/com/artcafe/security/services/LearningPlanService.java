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

@Service
@RequiredArgsConstructor
public class LearningPlanService {
    

    private final LearningPlanRepository learningPlanRepository;
    private final UserRepository userRepository;

    // Create a plan for a user
    public LearningPlan createLearningPlan() {
        LearningPlan plan = new LearningPlan();
        plan.setTitle("Test Learning Plan");
        plan.setDescription("Description for test learning plan");
        plan.setTargetCompletionDate(LocalDate.of(2025, 6, 1));

        PlanTopic topic1 = new PlanTopic("1", "Intro to MongoDB", false);
        PlanTopic topic2 = new PlanTopic("2", "Advanced MongoDB", false);
        plan.setTopics(List.of(topic1, topic2));

        return learningPlanRepository.save(plan); // This will save the document to MongoDB
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
    public LearningPlan markTopicCompleted(String topicId) {
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
