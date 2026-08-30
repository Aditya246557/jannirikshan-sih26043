package com.jannirikshan.university;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UniversityRepository extends JpaRepository<University, Long> {
    Optional<University> findByUserId(Long userId);
    Optional<University> findByCode(String code);
    List<University> findByStateIgnoreCase(String state);
    List<University> findByDistrictIgnoreCase(String district);
}
