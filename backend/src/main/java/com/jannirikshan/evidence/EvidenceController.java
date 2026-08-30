package com.jannirikshan.evidence;

import com.jannirikshan.common.ApiResponse;
import com.jannirikshan.common.enums.EvidenceStatus;
import com.jannirikshan.common.enums.EvidenceType;
import com.jannirikshan.user.User;
import com.jannirikshan.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/evidence")
public class EvidenceController {

    private final EvidenceService service;
    private final UserService userService;

    public EvidenceController(EvidenceService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @PostMapping({"/upload/{complaintId}", "/{complaintId}/upload"})
    public ResponseEntity<?> upload(
            @PathVariable Long complaintId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "evidenceType", required = false) EvidenceType evidenceType,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            Authentication authentication
    ) {
        List<EvidenceResponse> results = new ArrayList<>();
        for (MultipartFile file : files) {
            results.add(service.upload(
                    complaintId,
                    file,
                    evidenceType,
                    description,
                    latitude,
                    longitude,
                    authentication.getName()
            ));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(results));
    }

    @GetMapping({"/complaint/{complaintId}", "/complaints/{complaintId}", "/{complaintId:[0-9]+}"})
    public ResponseEntity<?> getForComplaint(@PathVariable Long complaintId) {
        return ResponseEntity.ok(ApiResponse.success(service.getForComplaint(complaintId)));
    }

    @GetMapping({"/project/{projectId}", "/projects/{projectId}"})
    public ResponseEntity<?> getForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(service.getForProject(projectId)));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> verify(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        User adminUser = userService.findByEmail(authentication.getName());
        EvidenceStatus status = EvidenceStatus.valueOf(body.get("status").trim().toUpperCase());
        String note = body.get("note");
        return ResponseEntity.ok(ApiResponse.success(
                service.verifyEvidence(id, status, note, adminUser)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        service.delete(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Evidence deleted successfully"));
    }
}
