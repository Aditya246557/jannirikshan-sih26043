package com.adhikar.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.adhikar.backend.entity.IndustrySponsorship;

@Repository
public interface IndustrySponsorshipRepository extends JpaRepository<IndustrySponsorship, Long> {

    List<IndustrySponsorship> findByProjectId(Long projectId);

    List<IndustrySponsorship> findByChallengeId(String challengeId);

    List<IndustrySponsorship> findBySponsorEmail(String sponsorEmail);
}
