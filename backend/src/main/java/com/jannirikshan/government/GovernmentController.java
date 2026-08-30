package com.jannirikshan.government;

import com.jannirikshan.complaint.ComplaintResponse;
import com.jannirikshan.common.enums.ComplaintStatus;
import com.jannirikshan.common.enums.Priority;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/government")
public class GovernmentController {

    private final GovernmentService service;

    public GovernmentController(
            GovernmentService service) {

        this.service = service;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<GovernmentService.GovernmentStats>
    dashboard(
            Authentication authentication) {

        requireGovernment(authentication);

        return ResponseEntity.ok(
                service.getStats()
        );
    }

    @GetMapping("/complaints")
    public ResponseEntity<?> complaints(
            @RequestParam(required = false)
            String keyword,

            @RequestParam(required = false)
            ComplaintStatus status,

            @RequestParam(required = false)
            Priority priority,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size,

            Authentication authentication) {

        requireGovernment(authentication);

        return ResponseEntity.ok(
                service.getComplaints(
                        keyword,
                        status,
                        priority,
                        page,
                        size
                )
        );
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse>
    updateStatus(
            @PathVariable Long id,

            @RequestBody Map<String, String> body,

            Authentication authentication) {

        requireGovernment(authentication);

        ComplaintStatus status =
                ComplaintStatus.valueOf(
                        body.get("status")
                                .trim()
                                .toUpperCase()
                );

        return ResponseEntity.ok(
                service.updateStatus(
                        id,
                        status,
                        body.get("remarks")
                )
        );
    }

    @PutMapping("/complaints/{id}/assignment")
    public ResponseEntity<ComplaintResponse>
    assign(
            @PathVariable Long id,

            @RequestBody Map<String, Long> body,

            Authentication authentication) {

        requireGovernment(authentication);

        return ResponseEntity.ok(
                service.assign(
                        id,
                        body.get("departmentId"),
                        body.get("officerId")
                )
        );
    }

    private void requireGovernment(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getAuthorities()
                        .stream()
                        .noneMatch(a ->
                                a.getAuthority().equals("ROLE_GOVERNMENT") ||
                                a.getAuthority().equals("ROLE_ADMIN")
                        )) {

            throw new org.springframework.security.access.AccessDeniedException(
                    "Government or Admin access required."
            );
        }
    }
}