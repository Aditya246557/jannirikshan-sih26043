package com.sih.sociosphere.team;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByProjectId(Long projectId);
    Optional<Team> findFirstByProjectId(Long projectId);
}
