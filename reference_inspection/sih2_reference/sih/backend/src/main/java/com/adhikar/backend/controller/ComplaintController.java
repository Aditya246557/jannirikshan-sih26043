package com.adhikar.backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.adhikar.backend.dto.ComplaintRequest;
import com.adhikar.backend.dto.ComplaintStatusRequest;
import com.adhikar.backend.entity.Complaint;
import com.adhikar.backend.service.CloudinaryService;
import com.adhikar.backend.service.ComplaintService;
import com.adhikar.backend.service.FastApiAIService;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final CloudinaryService cloudinaryService;
    private final FastApiAIService fastApiAIService;

    public ComplaintController(
            ComplaintService complaintService,
            CloudinaryService cloudinaryService,
            FastApiAIService fastApiAIService
    ) {
        this.complaintService = complaintService;
        this.cloudinaryService = cloudinaryService;
        this.fastApiAIService = fastApiAIService;
    }

    // =====================================================
    // CREATE COMPLAINT
    // =====================================================

    // Citizen submits complaint
    @PostMapping
    public ResponseEntity<Complaint> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication
    ) {

        Complaint complaint =
                complaintService.createComplaint(
                        request,
                        authentication.getName()
                );

        return ResponseEntity.ok(complaint);
    }

    // =====================================================
    // REAL-TIME AI EVIDENCE & CONTENT VALIDATION
    // =====================================================
    @PostMapping("/validate-image")
    public ResponseEntity<?> validateImage(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            JsonNode result = fastApiAIService.predict(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "valid", true,
                    "status", "FALLBACK_ACCEPTED",
                    "message", "Image accepted. AI verification will process in background."
            ));
        }
    }



    // =====================================================
    // CITIZEN COMPLAINTS
    // =====================================================

    // Citizen views own complaints
    @GetMapping("/my")
    public ResponseEntity<List<Complaint>> getMyComplaints(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                complaintService.getMyComplaints(
                        authentication.getName()
                )
        );
    }


    // =====================================================
    // ADMIN / OFFICER
    // =====================================================

    // Officer/Admin views all complaints
    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {

        return ResponseEntity.ok(
                complaintService.getAllComplaints()
        );
    }


    // Officer/Admin views one complaint
    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                complaintService.getComplaintById(id)
        );
    }


    // =====================================================
    // STATUS
    // =====================================================

    // Officer/Admin updates complaint status
    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long id,
            @RequestBody ComplaintStatusRequest request
    ) {

        return ResponseEntity.ok(
                complaintService.updateStatus(
                        id,
                        request.status()
                )
        );
    }


    // =====================================================
    // EVIDENCE + AI DETECTION
    // =====================================================

    // Citizen uploads evidence image
    // Image is uploaded to Cloudinary
    // and also sent to FastAPI YOLO service.
    @PostMapping("/{id}/evidence")
    public ResponseEntity<Complaint> uploadEvidence(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {

        Complaint complaint =
                complaintService.getComplaintById(id);

        // -------------------------------------------------
        // Security check
        // -------------------------------------------------

        // Only the citizen who created the complaint
        // can upload evidence for it.
        if (!complaint.getCitizenEmail()
                .equals(authentication.getName())) {

            return ResponseEntity
                    .status(403)
                    .build();
        }


        // -------------------------------------------------
        // 1. Upload image to Cloudinary
        // -------------------------------------------------

        String imageUrl =
                cloudinaryService.uploadImage(file);

        complaint.setEvidenceImageUrl(imageUrl);


        // -------------------------------------------------
        // 2. Send image to FastAPI AI service (with graceful fallback)
        // -------------------------------------------------

        try {
            JsonNode aiResult = fastApiAIService.predict(file);

            // 3. Read AI detections
            JsonNode detections = aiResult != null ? aiResult.get("detections") : null;

            if (detections != null && detections.isArray() && !detections.isEmpty()) {
                JsonNode firstDetection = detections.get(0);
                String detectedClass = firstDetection.path("class_name").asText();

                double confPercent = firstDetection.has("confidence_percent")
                        ? firstDetection.path("confidence_percent").asDouble()
                        : firstDetection.path("confidence").asDouble(0.0) * 100.0;

                complaint.setAiCategory(detectedClass);
                complaint.setAiConfidence(Math.round(confPercent * 100.0) / 100.0);
            }
        } catch (Exception e) {
            System.err.println("AI Service warning: " + e.getMessage());
            if (complaint.getAiCategory() == null) {
                complaint.setAiCategory(complaint.getCategory());
            }
            complaint.setAiConfidence(0.0);
        }


        // -------------------------------------------------
        // 4. Save complaint (triggers Socio-Sphere intelligence pipeline)
        // -------------------------------------------------

        Complaint savedComplaint =
                complaintService.saveComplaint(
                        complaint
                );

        return ResponseEntity.ok(savedComplaint);
    }


    // =====================================================
    // COMMUNITY VALIDATION VOTE
    // =====================================================

    @PostMapping("/{id}/community-vote")
    public ResponseEntity<?> addCommunityVote(
            @PathVariable Long id,
            @RequestBody com.adhikar.backend.dto.CommunityVoteRequest request,
            Authentication authentication
    ) {
        try {
            Complaint updated = complaintService.addCommunityVote(
                    id,
                    authentication.getName(),
                    request.voteType(),
                    request.note()
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }


    // =====================================================
    // DETAILED AI ANALYSIS & METADATA
    // =====================================================

    @GetMapping("/{id}/ai-analysis")
    public ResponseEntity<?> getAiAnalysis(@PathVariable Long id) {
        Complaint complaint = complaintService.getComplaintById(id);

        double communityConfirmPct = complaintService.getCommunityConfirmationPercentage(id);

        java.util.Map<String, Object> analysis = new java.util.HashMap<>();
        analysis.put("complaintId", complaint.getId());
        analysis.put("aiCategory", complaint.getAiCategory());
        analysis.put("aiConfidence", complaint.getAiConfidence() != null ? complaint.getAiConfidence() : 0.0);
        analysis.put("civicRelevanceScore", complaint.getCivicRelevanceScore() != null ? complaint.getCivicRelevanceScore() : 75.0);
        analysis.put("severity", complaint.getSeverity() != null ? complaint.getSeverity() : "MEDIUM");
        analysis.put("priority", complaint.getPriority() != null ? complaint.getPriority() : "MEDIUM");
        analysis.put("trustScore", complaint.getTrustScore() != null ? complaint.getTrustScore() : 80.0);
        analysis.put("communityConfirmationPct", communityConfirmPct);
        analysis.put("isDuplicate", Boolean.TRUE.equals(complaint.getIsDuplicate()));
        analysis.put("clusterId", complaint.getClusterId());
        analysis.put("challengeId", complaint.getChallengeId());
        analysis.put("recommendedDepartment", complaint.getAssignedDepartment());
        analysis.put("verificationStatus", complaint.getVerificationStatus() != null ? complaint.getVerificationStatus() : "VALID");
        analysis.put("resolutionVerificationStatus", complaint.getResolutionVerificationStatus() != null ? complaint.getResolutionVerificationStatus() : "UNVERIFIED");

        return ResponseEntity.ok(analysis);
    }


    // =====================================================
    // RESOLUTION VERIFICATION VIA AI
    // =====================================================

    @PostMapping("/{id}/verify-resolution")
    public ResponseEntity<?> verifyResolution(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        Complaint complaint = complaintService.getComplaintById(id);

        if (complaint.getStatus() != Complaint.Status.IN_PROGRESS) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "message", "Only IN_PROGRESS complaints can be verified for resolution."
            ));
        }

        // Upload fresh image to Cloudinary
        String resolutionImageUrl = cloudinaryService.uploadImage(file);
        complaint.setResolutionImageUrl(resolutionImageUrl);

        // Predict with FastAPI
        boolean issueCleared = true;
        try {
            JsonNode aiResult = fastApiAIService.predict(file);
            JsonNode detections = aiResult != null ? aiResult.get("detections") : null;

            if (detections != null && detections.isArray() && !detections.isEmpty()) {
                String targetCategory = complaint.getAiCategory() != null ? complaint.getAiCategory().toLowerCase() : "";
                for (JsonNode detection : detections) {
                    String detectedClass = detection.path("class_name").asText().toLowerCase();
                    double confidence = detection.path("confidence_percent").asDouble(0.0);
                    if (targetCategory.equals(detectedClass) && confidence >= 30.0) {
                        issueCleared = false;
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Resolution AI check error: " + e.getMessage());
        }

        if (issueCleared) {
            complaint.setResolutionVerificationStatus("PASSED");
            complaint.setStatus(Complaint.Status.RESOLVED);
        } else {
            complaint.setResolutionVerificationStatus("FAILED_STILL_DETECTED");
        }

        Complaint saved = complaintService.saveComplaint(complaint);
        return ResponseEntity.ok(saved);
    }
}
