package com.sih.sociosphere.industry;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface IndustryRepository extends JpaRepository<Industry, Long> {
    Optional<Industry> findByUserId(Long userId);
    List<Industry> findBySectorIgnoreCase(String sector);
}
