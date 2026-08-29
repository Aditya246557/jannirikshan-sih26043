package com.sih.sociosphere.student;

import com.sih.sociosphere.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/students")
public class StudentController {
    private final StudentService service;
    private final StudentRepository repository;

    public StudentController(StudentService service, StudentRepository repository) {
        this.service = service;
        this.repository = repository;
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyProfile(authentication.getName())));
    }

    @PutMapping("/my-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Student body, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(service.updateProfile(authentication.getName(), body)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(repository.findAll()));
    }
}