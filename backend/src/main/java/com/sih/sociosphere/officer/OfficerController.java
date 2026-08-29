package com.sih.sociosphere.officer;

import com.sih.sociosphere.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/officers")
public class OfficerController {
    private final OfficerService service;
    public OfficerController(OfficerService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll()));
    }
}