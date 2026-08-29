package com.adhikar.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.adhikar.backend.entity.CommunityValidation;

@Repository
public interface CommunityValidationRepository extends JpaRepository<CommunityValidation, Long> {

    List<CommunityValidation> findByComplaintId(Long complaintId);

    Optional<CommunityValidation> findByComplaintIdAndUserEmail(Long complaintId, String userEmail);

    long countByComplaintIdAndVoteType(Long complaintId, String voteType);

    long countByComplaintId(Long complaintId);
}
