package com.sih.sociosphere.faculty;

import com.sih.sociosphere.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/faculty")
public class FacultyController {
    private final FacultyService service;
    private final FacultyRepository repository;

    public FacultyController(FacultyService service, FacultyRepository repository) {
        this.service = service;
        this.repository = repository;
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyProfile(authentication.getName())));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(repository.findAll()));
    }
}