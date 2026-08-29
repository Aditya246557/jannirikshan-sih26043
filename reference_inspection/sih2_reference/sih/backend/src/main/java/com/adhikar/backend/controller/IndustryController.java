package com.adhikar.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adhikar.backend.dto.SponsorProjectRequest;
import com.adhikar.backend.entity.IndustrySponsorship;
import com.adhikar.backend.service.IndustryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/industry")
public class IndustryController {

    private final IndustryService industryService;

    public IndustryController(IndustryService industryService) {
        this.industryService = industryService;
    }

    // =====================================================
    // SPONSOR A UNIVERSITY R&D PROJECT / CSR GRANT
    // =====================================================

    @PostMapping("/sponsor")
    public ResponseEntity<IndustrySponsorship> sponsorProject(
            @Valid @RequestBody SponsorProjectRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "industry@partner.org";
        IndustrySponsorship sponsorship = industryService.sponsorProject(request, email);
        return ResponseEntity.ok(sponsorship);
    }

    // =====================================================
    // GET SPONSORSHIPS
    // =====================================================

    @GetMapping("/sponsorships")
    public ResponseEntity<List<IndustrySponsorship>> getAllSponsorships() {
        return ResponseEntity.ok(industryService.getAllSponsorships());
    }
}
