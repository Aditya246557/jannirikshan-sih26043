package com.jannirikshan.evidence;

import com.jannirikshan.audit.AuditService;
import com.jannirikshan.common.enums.EvidenceStatus;
import com.jannirikshan.common.enums.EvidenceType;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.complaint.ComplaintRepository;
import com.jannirikshan.file.FileStorageService;
import com.jannirikshan.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final ComplaintRepository complaintRepository;
    private final com.jannirikshan.project.ProjectRepository projectRepository;
    private final FileStorageService fileStorageService;
    private final AuditService auditService;
    private final com.jannirikshan.ai.AiService aiService;

    public EvidenceService(
            EvidenceRepository evidenceRepository,
            ComplaintRepository complaintRepository,
            com.jannirikshan.project.ProjectRepository projectRepository,
            FileStorageService fileStorageService,
            AuditService auditService,
            com.jannirikshan.ai.AiService aiService
    ) {
        this.evidenceRepository = evidenceRepository;
        this.complaintRepository = complaintRepository;
        this.projectRepository = projectRepository;
        this.fileStorageService = fileStorageService;
        this.auditService = auditService;
        this.aiService = aiService;
    }

    @Transactional
    public EvidenceResponse upload(
            Long complaintId,
            MultipartFile file,
            EvidenceType evidenceType,
            String description,
            Double lat,
            Double lng,
            String email
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Evidence file is required.");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found."));

        validateFile(file);

        String storedName = fileStorageService.store(complaintId, file);
        String url = "/api/files/complaints/" + complaintId + "/" + storedName;

        Evidence evidence = new Evidence();
        evidence.setComplaint(complaint);
        evidence.setOriginalFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "evidence");
        evidence.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        evidence.setFileSize(file.getSize());
        evidence.setStorageFileName(storedName);
        evidence.setFileUrl(url);
        evidence.setEvidenceType(evidenceType != null ? evidenceType : (file.getContentType() != null && file.getContentType().startsWith("video") ? EvidenceType.VIDEO : EvidenceType.IMAGE));
        evidence.setDescription(description);
        evidence.setCapturedLocationLat(lat != null ? lat : complaint.getLatitude());
        evidence.setCapturedLocationLng(lng != null ? lng : complaint.getLongitude());
        evidence.setVerificationStatus(EvidenceStatus.PENDING);

        // Process image with real YOLO model and update complaint intelligence
        if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
            com.fasterxml.jackson.databind.JsonNode aiNode = aiService.processComplaintEvidence(complaint, file);
            if (aiNode != null) {
                boolean isValid = aiNode.has("valid") && aiNode.path("valid").asBoolean(true);
                String msg = aiNode.has("message") ? aiNode.path("message").asText() : "";
                evidence.setVerificationStatus(isValid ? EvidenceStatus.VERIFIED : EvidenceStatus.REJECTED);
                evidence.setVerificationNote(msg);
            } else {
                evidence.setVerificationStatus(EvidenceStatus.VERIFIED);
            }
            complaintRepository.save(complaint);
        } else {
            evidence.setVerificationStatus(EvidenceStatus.VERIFIED);
        }

        return toResponse(evidenceRepository.save(evidence));
    }

    @Transactional(readOnly = true)
    public List<EvidenceResponse> getForComplaint(Long complaintId) {
        return evidenceRepository.findByComplaintId(complaintId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EvidenceResponse> getForProject(Long projectId) {
        return projectRepository.findById(projectId)
                .map(p -> getForComplaint(p.getComplaint().getId()))
                .orElse(List.of());
    }

    @Transactional
    public EvidenceResponse verifyEvidence(Long evidenceId, EvidenceStatus status, String note, User adminUser) {
        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new IllegalArgumentException("Evidence not found."));

        evidence.setVerificationStatus(status);
        evidence.setVerifiedBy(adminUser != null ? adminUser.getName() : "Admin");
        evidence.setVerifiedAt(LocalDateTime.now());
        evidence.setVerificationNote(note != null ? note.trim() : "");

        Evidence saved = evidenceRepository.save(evidence);
        auditService.log("EVIDENCE_VERIFIED", "Evidence", saved.getId(), adminUser, "Status: " + status + " | Note: " + note);
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long evidenceId, String email) {
        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new IllegalArgumentException("Evidence not found."));

        Complaint complaint = evidence.getComplaint();
        if (complaint.getCreatedBy() == null || !complaint.getCreatedBy().getEmail().equalsIgnoreCase(email)) {
            throw new IllegalStateException("You are not allowed to delete this evidence.");
        }

        fileStorageService.delete(complaint.getId(), evidence.getStorageFileName());
        evidenceRepository.delete(evidence);
    }

    private void validateFile(MultipartFile file) {
        long maxSize = 50L * 1024L * 1024L;
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("Maximum evidence file size is 50 MB.");
        }
    }

    private EvidenceResponse toResponse(Evidence e) {
        return new EvidenceResponse(
                e.getId(),
                e.getComplaint().getId(),
                e.getOriginalFileName(),
                e.getContentType(),
                e.getFileSize(),
                e.getFileUrl(),
                e.getEvidenceType(),
                e.getDescription(),
                e.getCapturedLocationLat(),
                e.getCapturedLocationLng(),
                e.getVerificationStatus(),
                e.getVerifiedBy(),
                e.getVerifiedAt(),
                e.getVerificationNote(),
                e.getUploadedAt()
        );
    }
}
