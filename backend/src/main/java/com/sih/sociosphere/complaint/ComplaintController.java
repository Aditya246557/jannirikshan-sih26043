package com.sih.sociosphere.complaint;

import com.sih.sociosphere.ai.DuplicateDetectionService;
import com.sih.sociosphere.common.ApiResponse;
import com.sih.sociosphere.common.enums.ComplaintStatus;
import com.sih.sociosphere.common.enums.Priority;
import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    private final ComplaintService service;
    private final UserService userService;
    private final DuplicateDetectionService duplicateDetectionService;
    private final com.sih.sociosphere.ai.AiService aiService;

    public ComplaintController(
            ComplaintService service,
            UserService userService,
            DuplicateDetectionService duplicateDetectionService,
            com.sih.sociosphere.ai.AiService aiService
    ) {
        this.service = service;
        this.userService = userService;
        this.duplicateDetectionService = duplicateDetectionService;
        this.aiService = aiService;
    }

    @PostMapping("/validate-image")
    public ResponseEntity<?> validateImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(aiService.validateImage(file));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ComplaintRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                service.create(request, authentication.getName())
        ));
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(
                service.filterChallenges(keyword, category, district, status, priority, pageable)
        ));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.get(id)));
    }

    @GetMapping({"/mine", "/my"})
    public ResponseEntity<?> getMine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(service.getMine(authentication.getName(), pageable)));
    }

    @GetMapping("/explore")
    public ResponseEntity<?> explore(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(
                service.filterChallenges(keyword, category, district, status, priority, pageable)
        ));
    }

    @GetMapping("/public")
    public ResponseEntity<?> publicChallenges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success(service.filterChallenges(null, null, null, null, null, pageable)));
    }

    @RequestMapping(value = "/{id}/review", method = {RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<?> review(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        User adminUser = userService.findByEmail(authentication.getName());
        boolean approved = Boolean.TRUE.equals(body.get("approved"))
                || "APPROVED".equalsIgnoreCase(String.valueOf(body.get("status")))
                || "true".equalsIgnoreCase(String.valueOf(body.get("approved")));
        String remarks = body.get("remarks") != null ? body.get("remarks").toString() : "Reviewed and approved by Govt Admin";
        return ResponseEntity.ok(ApiResponse.success(service.review(id, approved, remarks, adminUser)));
    }

    @PostMapping("/{id}/clarification/request")
    public ResponseEntity<?> requestClarification(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        User adminUser = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(
                service.requestClarification(id, body.get("message"), adminUser)
        ));
    }

    @PostMapping("/{id}/clarification/respond")
    public ResponseEntity<?> respondClarification(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                service.submitClarification(id, body.get("message"), authentication.getName())
        ));
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<?> changePriority(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        User adminUser = userService.findByEmail(authentication.getName());
        Priority priority = Priority.valueOf(body.get("priority").toString());
        Double score = body.get("score") != null ? Double.parseDouble(body.get("score").toString()) : null;
        return ResponseEntity.ok(ApiResponse.success(
                service.changePriority(id, priority, score, adminUser)
        ));
    }

    @PatchMapping("/{id}/category")
    public ResponseEntity<?> changeCategory(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        User adminUser = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(
                service.changeCategory(id, body.get("category"), adminUser)
        ));
    }

    @PostMapping({"/{id}/assign-university", "/{id}/ai-assign", "/{id}/approve-and-assign"})
    public ResponseEntity<?> assignUniversity(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Long> body,
            Authentication authentication
    ) {
        User adminUser = userService.findByEmail(authentication.getName());
        Long universityId = body != null ? body.get("universityId") : null;
        Long departmentId = body != null ? body.get("departmentId") : null;
        Long facultyId = body != null ? body.get("facultyId") : null;
        return ResponseEntity.ok(ApiResponse.success(
                service.assignUniversity(id, universityId, departmentId, facultyId, adminUser)
        ));
    }

    @PostMapping("/merge-duplicate")
    public ResponseEntity<?> mergeDuplicate(
            @RequestBody Map<String, Long> body,
            Authentication authentication
    ) {
        User adminUser = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(
                duplicateDetectionService.mergeDuplicates(body.get("masterId"), body.get("duplicateId"), adminUser)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.update(id, request, authentication.getName())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication authentication) {
        service.cancel(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Challenge cancelled."));
    }
}
