package com.sih.sociosphere.review;

import com.sih.sociosphere.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping("/proposal/{proposalId}")
    public ResponseEntity<?> getForProposal(@PathVariable Long proposalId) {
        return ResponseEntity.ok(ApiResponse.success(service.getByProposal(proposalId)));
    }
}