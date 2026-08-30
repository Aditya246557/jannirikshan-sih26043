package com.jannirikshan.matching;

import com.jannirikshan.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/matching")
public class MatchingController {
    private final MatchingService service;

    public MatchingController(MatchingService service) {
        this.service = service;
    }

    @GetMapping("/challenge/{id}")
    public ResponseEntity<?> match(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.match(id)));
    }
}