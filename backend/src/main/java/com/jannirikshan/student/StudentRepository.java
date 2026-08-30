package com.jannirikshan.student;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    List<Student> findByUniversityId(Long universityId);
    List<Student> findByDepartmentId(Long departmentId);
}
