package com.sih.sociosphere.project;

import com.sih.sociosphere.common.ApiResponse;
import com.sih.sociosphere.common.enums.ProjectStage;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService service;

    public ProjectController(ProjectService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long complaintId = Long.parseLong(body.get("complaintId").toString());
        Long universityId = Long.parseLong(body.get("universityId").toString());
        Long mentorId = body.get("facultyMentorId") != null ? Long.parseLong(body.get("facultyMentorId").toString()) : null;
        String title = (String) body.get("title");
        String objective = (String) body.get("objective");
        String solutionDescription = (String) body.get("solutionDescription");
        String technologyStack = (String) body.get("technologyStack");
        Double cost = body.get("estimatedCost") != null ? Double.parseDouble(body.get("estimatedCost").toString()) : 250000.0;
        Integer months = body.get("timelineMonths") != null ? Integer.parseInt(body.get("timelineMonths").toString()) : 6;

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                service.createProject(complaintId, universityId, mentorId, title, objective, solutionDescription, technologyStack, cost, months, authentication.getName())
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getProject(id)));
    }

    @GetMapping("/university/{universityId}")
    public ResponseEntity<?> getUniversityProjects(@PathVariable Long universityId) {
        return ResponseEntity.ok(ApiResponse.success(service.getUniversityProjects(universityId)));
    }

    @GetMapping({"/mentor/{mentorId}", "/faculty/{mentorId}"})
    public ResponseEntity<?> getMentorProjects(@PathVariable Long mentorId) {
        return ResponseEntity.ok(ApiResponse.success(service.getMentorProjects(mentorId)));
    }

    @GetMapping("/my-projects")
    public ResponseEntity<?> getMyProjects(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "";
        return ResponseEntity.ok(ApiResponse.success(service.getMyProjects(email)));
    }

    @GetMapping("/challenge/{complaintId}")
    public ResponseEntity<?> getByChallenge(@PathVariable Long complaintId) {
        return ResponseEntity.ok(ApiResponse.success(service.getByComplaintId(complaintId)));
    }

    @GetMapping
    public ResponseEntity<?> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllProjects(
                PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"))
        )));
    }

    @RequestMapping(value = {"/{id}/stage", "/{id}/status"}, method = {RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> updateStage(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        String stageStr = body != null && body.get("stage") != null ? body.get("stage").toString() : (body != null && body.get("status") != null ? body.get("status").toString() : "DEVELOPMENT");
        ProjectStage stage;
        try {
            stage = ProjectStage.valueOf(stageStr.toUpperCase());
        } catch (Exception e) {
            stage = ProjectStage.DEVELOPMENT;
        }
        
        Integer progress = null;
        if (body != null) {
            if (body.get("progress") != null) {
                try { progress = Integer.valueOf(body.get("progress").toString()); } catch (Exception ignored) {}
            } else if (body.get("progressPercentage") != null) {
                try { progress = Integer.valueOf(body.get("progressPercentage").toString()); } catch (Exception ignored) {}
            }
        }
        
        String notes = body != null && body.get("notes") != null ? body.get("notes").toString() : null;
        String username = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(ApiResponse.success(
                service.updateStage(id, stage, progress, notes, username)
        ));
    }
}
