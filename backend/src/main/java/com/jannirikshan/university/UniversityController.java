package com.jannirikshan.university;

import com.jannirikshan.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/university")
public class UniversityController {

    private final UniversityService service;
    private final UniversityRepository universityRepository;

    public UniversityController(UniversityService service, UniversityRepository universityRepository) {
        this.service = service;
        this.universityRepository = universityRepository;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(universityRepository.findAll()));
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyUniversity(authentication.getName())));
    }

    @GetMapping("/{id}/assigned-challenges")
    public ResponseEntity<?> getAssignedChallenges(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getAssignedChallenges(id)));
    }

    @PostMapping("/challenges/{id}/accept")
    public ResponseEntity<?> acceptChallenge(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Long> body,
            Authentication authentication
    ) {
        Long facultyId = body != null ? body.get("facultyId") : null;
        return ResponseEntity.ok(ApiResponse.success(service.acceptChallenge(id, facultyId, authentication.getName())));
    }

    @PostMapping("/challenges/{id}/reject")
    public ResponseEntity<?> rejectChallenge(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.rejectChallenge(id, body.get("reason"), authentication.getName())));
    }

    @GetMapping("/{id}/faculty")
    public ResponseEntity<?> getFaculty(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getFaculty(id)));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<?> getStudents(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getStudents(id)));
    }

    @GetMapping("/{id}/departments")
    public ResponseEntity<?> getDepartments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getDepartments(id)));
    }
}
