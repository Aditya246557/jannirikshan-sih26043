package com.jannirikshan.industry;

import com.jannirikshan.common.enums.PartnershipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IndustryPartnershipRepository extends JpaRepository<IndustryPartnership, Long> {
    List<IndustryPartnership> findByProjectId(Long projectId);
    List<IndustryPartnership> findByIndustryId(Long industryId);
    List<IndustryPartnership> findByChallengeId(Long challengeId);
    List<IndustryPartnership> findByProjectIdAndIndustryId(Long projectId, Long industryId);
    Optional<IndustryPartnership> findFirstByProjectIdAndIndustryIdAndPartnershipType(Long projectId, Long industryId, PartnershipType partnershipType);
    Optional<IndustryPartnership> findFirstByChallengeIdAndIndustryIdAndPartnershipType(Long challengeId, Long industryId, PartnershipType partnershipType);

    @Query("SELECT p FROM IndustryPartnership p " +
           "LEFT JOIN p.project proj " +
           "LEFT JOIN proj.university pu " +
           "LEFT JOIN p.challenge ch " +
           "WHERE (pu.id = :universityId) OR (ch.assignedUniversityId = :universityId) " +
           "ORDER BY p.createdAt DESC")
    List<IndustryPartnership> findByUniversityId(@Param("universityId") Long universityId);
}
