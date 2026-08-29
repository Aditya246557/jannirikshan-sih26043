package com.adhikar.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.adhikar.backend.entity.IssueCluster;

@Repository
public interface IssueClusterRepository extends JpaRepository<IssueCluster, Long> {

    Optional<IssueCluster> findByChallengeId(String challengeId);
}
