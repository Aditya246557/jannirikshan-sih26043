package com.adhikar.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.adhikar.backend.entity.UniversityProject;

@Repository
public interface UniversityProjectRepository extends JpaRepository<UniversityProject, Long> {

    List<UniversityProject> findByChallengeId(String challengeId);

    List<UniversityProject> findByUniversityName(String universityName);

    Optional<UniversityProject> findByChallengeIdAndUniversityName(String challengeId, String universityName);
}
