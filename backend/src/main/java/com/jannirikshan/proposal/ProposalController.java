package com.jannirikshan.proposal;

import com.jannirikshan.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/proposals")
public class ProposalController {

    private final ProposalService service;

    public ProposalController(ProposalService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProposalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.create(request)));
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(ApiResponse.success(service.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @GetMapping("/complaint/{complaintId}")
    public ResponseEntity<?> getForComplaint(@PathVariable Long complaintId) {
        return ResponseEntity.ok(ApiResponse.success(service.getForComplaint(complaintId)));
    }

    @GetMapping("/university/{universityId}")
    public ResponseEntity<?> getForUniversity(@PathVariable Long universityId) {
        return ResponseEntity.ok(ApiResponse.success(service.getByUniversity(universityId)));
    }

    @PatchMapping("/{id}/status")
    @PostMapping({"/{id}/status", "/{id}/review", "/{id}/approve"})
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, Object> body
    ) {
        String status = body != null && body.get("status") != null
                ? String.valueOf(body.get("status"))
                : (body != null && body.containsKey("approved") && "true".equalsIgnoreCase(String.valueOf(body.get("approved"))) ? "APPROVED" : "APPROVED");
        String remarks = body != null && body.get("remarks") != null
                ? String.valueOf(body.get("remarks"))
                : (body != null && body.get("feedback") != null ? String.valueOf(body.get("feedback")) : "Approved by Government Committee");
        return ResponseEntity.ok(ApiResponse.success(
                service.updateStatus(id, status, remarks)
        ));
    }
}