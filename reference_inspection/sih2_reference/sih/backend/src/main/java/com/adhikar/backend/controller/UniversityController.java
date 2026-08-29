package com.adhikar.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.adhikar.backend.dto.AdoptChallengeRequest;
import com.adhikar.backend.dto.UpdateMilestoneRequest;
import com.adhikar.backend.entity.UniversityProject;
import com.adhikar.backend.service.UniversityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/university")
public class UniversityController {

    private final UniversityService universityService;

    public UniversityController(UniversityService universityService) {
        this.universityService = universityService;
    }

    // =====================================================
    // GET MATCHED CHALLENGES FOR UNIVERSITIES
    // =====================================================

    @GetMapping("/challenges")
    public ResponseEntity<List<Map<String, Object>>> getMatchedChallenges(
            @RequestParam(value = "domain", required = false, defaultValue = "General") String domain
    ) {
        return ResponseEntity.ok(universityService.getMatchedChallenges(domain));
    }

    // =====================================================
    // ADOPT A CHALLENGE
    // =====================================================

    @PostMapping("/projects/adopt")
    public ResponseEntity<?> adoptChallenge(
            @Valid @RequestBody AdoptChallengeRequest request
    ) {
        try {
            UniversityProject project = universityService.adoptChallenge(request);
            return ResponseEntity.ok(project);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =====================================================
    // GET ADOPTED PROJECTS
    // =====================================================

    @GetMapping("/projects")
    public ResponseEntity<List<UniversityProject>> getAllProjects() {
        return ResponseEntity.ok(universityService.getAllProjects());
    }

    // =====================================================
    // UPDATE MILESTONE & PROTOTYPE URL
    // =====================================================

    @PutMapping("/projects/{id}/milestone")
    public ResponseEntity<UniversityProject> updateMilestone(
            @PathVariable Long id,
            @RequestBody UpdateMilestoneRequest request
    ) {
        UniversityProject updated = universityService.updateMilestone(id, request.status(), request.prototypeUrl());
        return ResponseEntity.ok(updated);
    }
}
