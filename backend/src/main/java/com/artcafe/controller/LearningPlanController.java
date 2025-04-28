package com.artcafe.controller;

import com.artcafe.model.LearningPlan;
import com.artcafe.model.PlanTopic;
import com.artcafe.security.services.LearningPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
@RequiredArgsConstructor
public class LearningPlanController {

    private final LearningPlanService learningPlanService;

    @PostMapping("/{userId}")
    public LearningPlan createPlan(@PathVariable String userId, @RequestBody LearningPlan plan) {
        return learningPlanService.createPlan(userId, plan);
    }

    @GetMapping("/{userId}")
    public List<LearningPlan> getPlans(@PathVariable Long userId) {
        return learningPlanService.getPlansByUser(userId);
    }

    @PutMapping("/{planId}")
    public LearningPlan updatePlan(@PathVariable Long planId, @RequestBody LearningPlan plan) {
        return learningPlanService.updatePlan(planId, plan);
    }

    @DeleteMapping("/{planId}")
    public String deletePlan(@PathVariable Long planId) {
        learningPlanService.deletePlan(planId);
        return "Learning Plan Deleted Successfully";
    }

    @PutMapping("/topics/{topicId}/complete")
    public PlanTopic completeTopic(@PathVariable Long topicId) {
        return learningPlanService.markTopicCompleted(topicId);
    }
}
