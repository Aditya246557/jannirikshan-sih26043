package com.sih.sociosphere.location;

import com.sih.sociosphere.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/locations")
public class LocationController {
    private final LocationService service;

    public LocationController(LocationService service) {
        this.service = service;
    }

    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts() {
        return ResponseEntity.ok(ApiResponse.success(service.getDistricts()));
    }
}