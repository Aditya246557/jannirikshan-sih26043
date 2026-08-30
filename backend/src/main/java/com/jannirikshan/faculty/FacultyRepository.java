package com.jannirikshan.faculty;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByUserId(Long userId);
    List<Faculty> findByUniversityId(Long universityId);
    List<Faculty> findByDepartmentId(Long departmentId);
}
