package com.jannirikshan.complaint;

import com.jannirikshan.common.enums.ComplaintStatus;
import com.jannirikshan.common.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Page<Complaint> findByCreatedById(Long createdById, Pageable pageable);

    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);

    Page<Complaint> findByPriority(Priority priority, Pageable pageable);

    Page<Complaint> findByStatusAndPriority(ComplaintStatus status, Priority priority, Pageable pageable);

    Page<Complaint> findByCategoryIgnoreCase(String category, Pageable pageable);

    Page<Complaint> findByDistrictIgnoreCase(String district, Pageable pageable);

    Page<Complaint> findByAssignedUniversityId(Long universityId, Pageable pageable);

    Page<Complaint> findByAssignedFacultyId(Long facultyId, Pageable pageable);

    List<Complaint> findByAssignedUniversityIdAndStatus(Long universityId, ComplaintStatus status);

    List<Complaint> findByMasterChallengeId(Long masterChallengeId);

    @Query("SELECT c FROM Complaint c WHERE " +
            "(CAST(:keyword AS string) IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
            "(CAST(:category AS string) IS NULL OR LOWER(c.category) = LOWER(CAST(:category AS string))) AND " +
            "(CAST(:district AS string) IS NULL OR LOWER(c.district) = LOWER(CAST(:district AS string))) AND " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(:priority IS NULL OR c.priority = :priority)")
    Page<Complaint> filterChallenges(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("district") String district,
            @Param("status") ComplaintStatus status,
            @Param("priority") Priority priority,
            Pageable pageable
    );

    Page<Complaint> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String desc, Pageable pageable);

    long countByStatus(ComplaintStatus status);
    long countByPriority(Priority priority);
    long countByDistrictIgnoreCase(String district);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategoryGroup();

    @Query("SELECT c.district, COUNT(c) FROM Complaint c WHERE c.district IS NOT NULL GROUP BY c.district")
    List<Object[]> countByDistrictGroup();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countByStatusGroup();

    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> countByPriorityGroup();
}