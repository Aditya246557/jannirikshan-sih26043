package com.jannirikshan.analytics;

import com.jannirikshan.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService service;

    public AnalyticsController(AnalyticsService service) {
        this.service = service;
    }

    @GetMapping({"/overview", "/dashboard", ""})
    public ResponseEntity<?> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(service.getAnalyticsOverview()));
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<?> getDistrict(@PathVariable String district) {
        return ResponseEntity.ok(ApiResponse.success(service.getDistrictAnalytics(district)));
    }
}
