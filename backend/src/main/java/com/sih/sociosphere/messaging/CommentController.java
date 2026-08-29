package com.sih.sociosphere.messaging;

import com.sih.sociosphere.audit.AuditService;
import com.sih.sociosphere.common.ApiResponse;
import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.complaint.ComplaintRepository;
import com.sih.sociosphere.project.Project;
import com.sih.sociosphere.project.ProjectRepository;
import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final ComplaintRepository complaintRepository;
    private final ProjectRepository projectRepository;
    private final UserService userService;
    private final AuditService auditService;

    public CommentController(
            CommentRepository commentRepository,
            ComplaintRepository complaintRepository,
            ProjectRepository projectRepository,
            UserService userService,
            AuditService auditService
    ) {
        this.commentRepository = commentRepository;
        this.complaintRepository = complaintRepository;
        this.projectRepository = projectRepository;
        this.userService = userService;
        this.auditService = auditService;
    }

    @GetMapping("/challenge/{challengeId}")
    public ResponseEntity<?> getForChallenge(@PathVariable Long challengeId) {
        return ResponseEntity.ok(ApiResponse.success(commentRepository.findByComplaintIdOrderByCreatedAtAsc(challengeId)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(commentRepository.findByProjectIdOrderByCreatedAtAsc(projectId)));
    }

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody Map<String, Object> body, Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        Long challengeId = null;
        if (body.get("challengeId") != null && !body.get("challengeId").toString().trim().isEmpty()) {
            try {
                challengeId = Long.parseLong(body.get("challengeId").toString().trim());
            } catch (Exception ignored) {}
        } else if (body.get("complaintId") != null && !body.get("complaintId").toString().trim().isEmpty()) {
            try {
                challengeId = Long.parseLong(body.get("complaintId").toString().trim());
            } catch (Exception ignored) {}
        }

        Long projectId = null;
        if (body.get("projectId") != null && !body.get("projectId").toString().trim().isEmpty()) {
            try {
                projectId = Long.parseLong(body.get("projectId").toString().trim());
            } catch (Exception ignored) {}
        }

        String content = body.get("content") != null ? body.get("content").toString() : "";
        boolean isInternal = Boolean.TRUE.equals(body.get("isInternal"));

        Complaint c = challengeId != null ? complaintRepository.findById(challengeId).orElse(null) : null;
        Project p = projectId != null ? projectRepository.findById(projectId).orElse(null) : null;

        Comment comment = new Comment();
        comment.setComplaint(c);
        comment.setProject(p);
        comment.setAuthor(user);
        comment.setContent(content);
        comment.setInternal(isInternal);

        Comment saved = commentRepository.save(comment);

        if (c != null) {
            auditService.log("CITIZEN_FEEDBACK_SUBMITTED", "Complaint", c.getId(), user, "Citizen verification feedback submitted: " + (content.length() > 60 ? content.substring(0, 60) + "..." : content));
        } else if (p != null) {
            auditService.log("PROJECT_COMMENT_ADDED", "Project", p.getId(), user, "Comment recorded on project: " + (content.length() > 60 ? content.substring(0, 60) + "..." : content));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(saved));
    }
}
