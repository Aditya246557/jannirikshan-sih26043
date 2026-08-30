package com.jannirikshan.collaboration;

import com.jannirikshan.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/collaborations")
public class CollaborationController {

    private final CollaborationService service;

    public CollaborationController(CollaborationService service) {
        this.service = service;
    }

    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<?> getForComplaint(@PathVariable Long complaintId) {
        return ResponseEntity.ok(ApiResponse.success(service.getForComplaint(complaintId)));
    }
}