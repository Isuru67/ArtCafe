package com.artcafe.controller;

import com.artcafe.dto.LearningPlanDto;
import com.artcafe.dto.PlanTopicDto;
import com.artcafe.model.LearningPlan;
import com.artcafe.model.PlanTopic;
import com.artcafe.security.services.LearningPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/learning-plans")
@RequiredArgsConstructor
public class LearningPlanController {

    private final LearningPlanService learningPlanService;

    @PostMapping("/{userId}")
    public LearningPlanDto createPlan(@PathVariable String userId, @RequestBody LearningPlan plan) {
        LearningPlan createdPlan = learningPlanService.createLearningPlan(userId, plan);
        return convertToDto(createdPlan);
    }

    @GetMapping("/{userId}")
    public List<LearningPlan> getPlans(@PathVariable String userId) {
        return learningPlanService.getPlansByUser(userId);
    }

    @PutMapping("/{planId}")
    
    public LearningPlan updatePlan(@PathVariable String planId, @RequestBody LearningPlan plan) {
        return learningPlanService.updatePlan(planId, plan);
    }

    @DeleteMapping("/{planId}")
    public String deletePlan(@PathVariable String planId) {
        learningPlanService.deletePlan(planId);
        return "Learning Plan Deleted Successfully";
    }

    @PutMapping("/topics/{topicId}/complete")
    public LearningPlan completeTopic(@PathVariable String topicId) {
        return learningPlanService.markTopicCompleted(topicId);
    }
    @GetMapping("/{userId}")
public List<LearningPlanDto> getPlansDto(@PathVariable String userId) {
    List<LearningPlan> plans = learningPlanService.getPlansByUser(userId);
    return plans.stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
}

private LearningPlanDto convertToDto(LearningPlan plan) {
    return new LearningPlanDto(
        plan.getId(),
        plan.getTitle(),
        plan.getDescription(),
        plan.getTargetCompletionDate(),
        plan.getCreatedBy(),
        plan.getTopics().stream()
            .map(topic -> new PlanTopicDto((String) topic.getId(), topic.getTopicName(), topic.isCompleted()))
            .toList()
    );
}
@GetMapping("/single/{planId}")
public LearningPlan getPlanById(@PathVariable String planId) {
    return learningPlanService.getPlanById(planId);
}


}
