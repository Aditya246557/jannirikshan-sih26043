package com.jannirikshan.milestone;

import com.jannirikshan.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/milestones")
public class MilestoneController {

    private final MilestoneService service;

    public MilestoneController(MilestoneService service) {
        this.service = service;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(service.getByProject(projectId)));
    }

    @PostMapping("/project/{projectId}")
    public ResponseEntity<?> create(
            @PathVariable Long projectId,
            @RequestBody Map<String, Object> body
    ) {
        String title = (String) body.get("title");
        String desc = (String) body.get("description");
        LocalDate date = body.get("targetDate") != null ? LocalDate.parse(body.get("targetDate").toString()) : null;
        Integer order = body.get("milestoneOrder") != null ? Integer.parseInt(body.get("milestoneOrder").toString()) : 1;
        return ResponseEntity.ok(ApiResponse.success(service.create(projectId, title, desc, date, order)));
    }

    @PostMapping({"/{id}/submit", "/{id}/submit-deliverables"})
    public ResponseEntity<?> submit(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                service.submitForReview(id, body.get("deliverables"), body.get("submissionNotes"), authentication.getName())
        ));
    }

    @PostMapping({"/{id}/review", "/{id}/review-deliverables"})
    public ResponseEntity<?> review(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        boolean approved = Boolean.TRUE.equals(body.get("approved"))
                || "APPROVED".equalsIgnoreCase(String.valueOf(body.get("approved")))
                || "APPROVED".equalsIgnoreCase(String.valueOf(body.get("status")));
        String feedback = (String) body.get("feedback");
        return ResponseEntity.ok(ApiResponse.success(
                service.reviewMilestone(id, approved, feedback, authentication.getName())
        ));
    }
}
