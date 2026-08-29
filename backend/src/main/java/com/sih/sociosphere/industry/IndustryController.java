package com.sih.sociosphere.industry;

import com.sih.sociosphere.common.ApiResponse;
import com.sih.sociosphere.common.enums.PartnershipType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/industry")
public class IndustryController {

    private final IndustryService service;
    private final IndustryRepository industryRepository;

    public IndustryController(IndustryService service, IndustryRepository industryRepository) {
        this.service = service;
        this.industryRepository = industryRepository;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(industryRepository.findAll()));
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyIndustry(authentication.getName())));
    }

    @PostMapping({"/partnerships/express-interest", "/express-interest", "/interest"})
    public ResponseEntity<?> expressInterest(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long projectId = null;
        if (body.get("projectId") != null && !body.get("projectId").toString().trim().isEmpty() && !body.get("projectId").toString().equals("undefined")) {
            try {
                projectId = Long.parseLong(body.get("projectId").toString().trim());
            } catch (Exception ignored) {}
        }

        Long challengeId = null;
        if (body.get("challengeId") != null && !body.get("challengeId").toString().trim().isEmpty() && !body.get("challengeId").toString().equals("undefined")) {
            try {
                challengeId = Long.parseLong(body.get("challengeId").toString().trim());
            } catch (Exception ignored) {}
        }

        PartnershipType type = PartnershipType.CSR_SPONSORSHIP;
        if (body.get("partnershipType") != null) {
            String typeStr = body.get("partnershipType").toString().trim().toUpperCase();
            try {
                type = PartnershipType.valueOf(typeStr);
            } catch (Exception ignored) {
                type = PartnershipType.CSR_SPONSORSHIP;
            }
        }

        Double amount = 0.0;
        if (body.get("fundingAmount") != null) {
            try {
                amount = Double.parseDouble(body.get("fundingAmount").toString().trim());
            } catch (Exception ignored) {}
        }

        String mentorship = body.get("mentorshipScope") != null ? body.get("mentorshipScope").toString() : "";
        String tech = body.get("technologyResourcesOffered") != null ? body.get("technologyResourcesOffered").toString() : "";
        String details = body.get("proposalDetails") != null ? body.get("proposalDetails").toString() : "";

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                service.expressInterest(projectId, challengeId, type, amount, mentorship, tech, details, authentication.getName())
        ));
    }

    @PostMapping({"/partnerships/{id}/approve", "/partnerships/{id}/accept", "/{id}/approve", "/{id}/accept"})
    public ResponseEntity<?> approvePartnership(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(service.approvePartnership(id, authentication.getName())));
    }

    @PostMapping({"/partnerships/{id}/reject", "/{id}/reject"})
    public ResponseEntity<?> rejectPartnership(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication
    ) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(ApiResponse.success(service.rejectPartnership(id, reason, authentication.getName())));
    }

    @GetMapping({"/partnerships/university/{universityId}", "/university/{universityId}/partnerships", "/university/{universityId}/industry-offers"})
    public ResponseEntity<?> getUniversityPartnerships(@PathVariable Long universityId) {
        return ResponseEntity.ok(ApiResponse.success(service.getPartnershipsForUniversity(universityId)));
    }

    @GetMapping({"/partnerships/project/{projectId}", "/project/{projectId}"})
    public ResponseEntity<?> getProjectPartnerships(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(service.getPartnershipsForProject(projectId)));
    }

    @GetMapping({"/funding/project/{projectId}", "/projects/{projectId}/funding"})
    public ResponseEntity<?> getProjectFunding(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(service.getFundingForProject(projectId)));
    }

    @GetMapping({"/my-commitments", "/commitments"})
    public ResponseEntity<?> getMyCommitments(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyPartnerships(authentication.getName())));
    }
}
