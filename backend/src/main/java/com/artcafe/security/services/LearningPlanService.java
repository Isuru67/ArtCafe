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

        for (PlanTopic topic : plan.getTopics()) {
            topic.setLearningPlan(plan);
        }
        return learningPlanRepository.save(plan);
    }

    public List<LearningPlan> getPlansByUser(Long userId) {
        return learningPlanRepository.findByCreatedById(userId);
    }

    public LearningPlan updatePlan(Long planId, LearningPlan updatedPlan) {
        LearningPlan existingPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        existingPlan.setTitle(updatedPlan.getTitle());
        existingPlan.setDescription(updatedPlan.getDescription());
        existingPlan.setTargetCompletionDate(updatedPlan.getTargetCompletionDate());
        return learningPlanRepository.save(existingPlan);
    }

    public void deletePlan(Long planId) {
        learningPlanRepository.deleteById(planId);
    }

    public PlanTopic markTopicCompleted(Long topicId) {
        PlanTopic topic = planTopicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        topic.setCompleted(true);
        return planTopicRepository.save(topic);
    }
}

