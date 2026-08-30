package com.jannirikshan.citizen;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CitizenProfileRepository extends JpaRepository<CitizenProfile, Long> {
    Optional<CitizenProfile> findByUserId(Long userId);
}
