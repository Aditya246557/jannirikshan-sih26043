package com.jannirikshan.review;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository repository;

    public ReviewService(ReviewRepository repository) {
        this.repository = repository;
    }

    public List<ProposalReview> getByProposal(Long proposalId) {
        return repository.findByProposalId(proposalId);
    }
}