package com.sih.sociosphere.project;

import com.sih.sociosphere.common.enums.ProjectStage;
import com.sih.sociosphere.common.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByComplaintId(Long complaintId);
    List<Project> findByUniversityId(Long universityId);
    List<Project> findByUniversityIdOrderByIdDesc(Long universityId);
    Page<Project> findByUniversityId(Long universityId, Pageable pageable);
    List<Project> findByFacultyMentorId(Long facultyMentorId);
    List<Project> findByFacultyMentorIdOrderByIdDesc(Long facultyMentorId);
    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);
    Page<Project> findByStage(ProjectStage stage, Pageable pageable);
    long countByStatus(ProjectStatus status);
    long countByStage(ProjectStage stage);
}
