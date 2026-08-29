package com.sih.sociosphere.impact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ImpactRepository extends JpaRepository<ImpactMetric, Long> {
    Optional<ImpactMetric> findByComplaintId(Long complaintId);
    Optional<ImpactMetric> findByProjectId(Long projectId);

    @Query("SELECT SUM(i.peopleBenefited), SUM(i.villagesCovered), SUM(i.costSavedInr), AVG(i.socialImpactScore) FROM ImpactMetric i")
    List<Object[]> getAggregatedImpact();
}