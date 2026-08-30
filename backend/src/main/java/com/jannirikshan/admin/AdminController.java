package com.jannirikshan.admin;

import com.jannirikshan.common.ApiResponse;
import com.jannirikshan.common.enums.UserRole;
import com.jannirikshan.complaint.ComplaintService;
import com.jannirikshan.user.User;
import com.jannirikshan.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService service;
    private final ComplaintService complaintService;
    private final UserService userService;

    public AdminController(AdminService service, ComplaintService complaintService, UserService userService) {
        this.service = service;
        this.complaintService = complaintService;
        this.userService = userService;
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> dashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(service.getDashboardStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<?> users(@RequestParam(required = false) UserRole role) {
        return ResponseEntity.ok(ApiResponse.success(service.users(role)));
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        UserRole role = UserRole.valueOf(body.get("role").trim().toUpperCase());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                service.createUser(body.get("name"), body.get("email"), body.get("password"), role)
        ));
    }

    @PatchMapping("/users/{id}/enabled")
    public ResponseEntity<?> setEnabled(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.success(service.setEnabled(id, Boolean.TRUE.equals(body.get("enabled")))));
    }

    @PostMapping("/assign-university")
    public ResponseEntity<?> assignUniversity(@RequestBody Map<String, Object> body, Authentication authentication) {
        User adminUser = userService.findByEmail(authentication.getName());
        Long complaintId = body.get("complaintId") != null ? Long.parseLong(body.get("complaintId").toString()) : null;
        Long universityId = body.get("universityId") != null ? Long.parseLong(body.get("universityId").toString()) : null;
        Long departmentId = body.get("departmentId") != null ? Long.parseLong(body.get("departmentId").toString()) : null;
        Long facultyId = body.get("facultyId") != null ? Long.parseLong(body.get("facultyId").toString()) : null;

        return ResponseEntity.ok(ApiResponse.success(
                complaintService.assignUniversity(complaintId, universityId, departmentId, facultyId, adminUser)
        ));
    }

    @RequestMapping(value = "/complaints/{id}/review", method = {RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<?> reviewComplaint(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        User adminUser = userService.findByEmail(authentication.getName());
        boolean approved = Boolean.TRUE.equals(body.get("approved"))
                || "APPROVED".equalsIgnoreCase(String.valueOf(body.get("status")))
                || "true".equalsIgnoreCase(String.valueOf(body.get("approved")));
        String remarks = body.get("remarks") != null ? body.get("remarks").toString() : "Reviewed and approved by Govt Admin";

        return ResponseEntity.ok(ApiResponse.success(
                complaintService.review(id, approved, remarks, adminUser)
        ));
    }
}
