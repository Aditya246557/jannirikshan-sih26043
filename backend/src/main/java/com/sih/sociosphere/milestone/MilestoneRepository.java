package com.sih.sociosphere.milestone;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByProjectIdOrderByMilestoneOrderAsc(Long projectId);
}
