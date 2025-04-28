package com.artcafe.repository;

import com.artcafe.model.LearningPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    List<LearningPlan> findByCreatedById(Long userId);
}
