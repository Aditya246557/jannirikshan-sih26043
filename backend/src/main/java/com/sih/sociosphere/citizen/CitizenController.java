package com.sih.sociosphere.citizen;

import com.sih.sociosphere.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/citizen")
public class CitizenController {
    private final CitizenService service;

    public CitizenController(CitizenService service) {
        this.service = service;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(service.getMyProfile(authentication.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody CitizenProfile profile, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(service.updateProfile(authentication.getName(), profile)));
    }
}