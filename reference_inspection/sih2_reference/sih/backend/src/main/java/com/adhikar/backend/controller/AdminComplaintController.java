package com.adhikar.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adhikar.backend.dto.ComplaintDepartmentRequest;
import com.adhikar.backend.dto.ComplaintPriorityRequest;
import com.adhikar.backend.dto.ComplaintRejectRequest;
import com.adhikar.backend.dto.ComplaintReviewRequest;
import com.adhikar.backend.dto.ComplaintStatusRequest;
import com.adhikar.backend.entity.Complaint;
import com.adhikar.backend.service.ComplaintService;

@RestController
@RequestMapping("/api/admin/complaints")
public class AdminComplaintController {

    private final ComplaintService complaintService;

    public AdminComplaintController(
            ComplaintService complaintService
    ) {
        this.complaintService = complaintService;
    }

    // ==============================
    // GET ALL COMPLAINTS
    // ==============================

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {

        return ResponseEntity.ok(
                complaintService.getAllComplaints()
        );
    }

    // ==============================
    // GET COMPLAINT BY ID
    // ==============================

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaint(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                complaintService.getComplaintById(id)
        );
    }

    // ==============================
    // START REVIEW
    // PENDING → UNDER_REVIEW
    // ==============================

    @PutMapping("/{id}/review")
    public ResponseEntity<Complaint> startReview(
            @PathVariable Long id,
            @RequestBody(required = false)
            ComplaintReviewRequest request
    ) {

        String remarks = request == null
                ? null
                : request.remarks();

        return ResponseEntity.ok(
                complaintService.startReview(
                        id,
                        remarks
                )
        );
    }

    // ==============================
    // VALIDATE
    // UNDER_REVIEW → VALIDATED
    // ==============================

    @PutMapping("/{id}/validate")
    public ResponseEntity<Complaint> validateComplaint(
            @PathVariable Long id,
            @RequestBody(required = false)
            ComplaintReviewRequest request
    ) {

        String remarks = request == null
                ? null
                : request.remarks();

        return ResponseEntity.ok(
                complaintService.validateComplaint(
                        id,
                        remarks
                )
        );
    }

    // ==============================
    // REJECT
    // ==============================

    @PutMapping("/{id}/reject")
    public ResponseEntity<Complaint> rejectComplaint(
            @PathVariable Long id,
            @RequestBody ComplaintRejectRequest request
    ) {

        return ResponseEntity.ok(
                complaintService.rejectComplaint(
                        id,
                        request.reason(),
                        request.remarks()
                )
        );
    }

    // ==============================
    // UPDATE PRIORITY
    // ==============================

    @PutMapping("/{id}/priority")
    public ResponseEntity<Complaint> updatePriority(
            @PathVariable Long id,
            @RequestBody ComplaintPriorityRequest request
    ) {

        return ResponseEntity.ok(
                complaintService.updatePriority(
                        id,
                        request.priority()
                )
        );
    }

    // ==============================
    // ASSIGN DEPARTMENT
    // ==============================

    @PutMapping("/{id}/department")
    public ResponseEntity<Complaint> assignDepartment(
            @PathVariable Long id,
            @RequestBody ComplaintDepartmentRequest request
    ) {

        return ResponseEntity.ok(
                complaintService.assignDepartment(
                        id,
                        request.department()
                )
        );
    }

    // ==============================
    // STATUS UPDATE
    // VALIDATED → IN_PROGRESS
    // IN_PROGRESS → RESOLVED
    // ==============================

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

    // ==============================
    // GOVERNMENT ANALYTICS KPI DASHBOARD
    // ==============================

    @GetMapping("/analytics")
    public ResponseEntity<?> getAdminAnalytics() {

        List<Complaint> complaints = complaintService.getAllComplaints();

        long total = complaints.size();
        long valid = complaints.stream().filter(c -> "VALID".equalsIgnoreCase(c.getVerificationStatus())).count();
        long suspicious = complaints.stream().filter(c -> "REQUIRES_REVIEW".equalsIgnoreCase(c.getVerificationStatus())).count();
        long rejected = complaints.stream().filter(c -> Complaint.Status.REJECTED.equals(c.getStatus())).count();
        long critical = complaints.stream().filter(c -> "CRITICAL".equalsIgnoreCase(c.getPriority())).count();
        long highPriority = complaints.stream().filter(c -> "HIGH".equalsIgnoreCase(c.getPriority())).count();
        long inProgress = complaints.stream().filter(c -> Complaint.Status.IN_PROGRESS.equals(c.getStatus())).count();
        long resolved = complaints.stream().filter(c -> Complaint.Status.RESOLVED.equals(c.getStatus())).count();
        long pending = complaints.stream().filter(c -> Complaint.Status.PENDING.equals(c.getStatus())).count();

        long potholes = complaints.stream().filter(c -> c.getAiCategory() != null && c.getAiCategory().toLowerCase().contains("pothole")).count();
        long garbage = complaints.stream().filter(c -> c.getAiCategory() != null && c.getAiCategory().toLowerCase().contains("garbage")).count();
        long streetlights = complaints.stream().filter(c -> c.getAiCategory() != null && c.getAiCategory().toLowerCase().contains("light")).count();
        long fallenTrees = complaints.stream().filter(c -> c.getAiCategory() != null && c.getAiCategory().toLowerCase().contains("tree")).count();

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalComplaints", total);
        stats.put("validComplaints", valid);
        stats.put("suspiciousComplaints", suspicious);
        stats.put("rejectedComplaints", rejected);
        stats.put("criticalComplaints", critical);
        stats.put("highPriorityComplaints", highPriority);
        stats.put("inProgressComplaints", inProgress);
        stats.put("resolvedComplaints", resolved);
        stats.put("pendingComplaints", pending);

        java.util.Map<String, Long> categoryCounts = new java.util.HashMap<>();
        categoryCounts.put("pothole", potholes);
        categoryCounts.put("garbage", garbage);
        categoryCounts.put("broken_street_light", streetlights);
        categoryCounts.put("fallen_tree", fallenTrees);
        stats.put("categoryAnalytics", categoryCounts);

        return ResponseEntity.ok(stats);
    }
}