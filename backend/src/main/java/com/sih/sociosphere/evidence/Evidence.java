package com.sih.sociosphere.evidence;

import com.sih.sociosphere.common.enums.EvidenceStatus;
import com.sih.sociosphere.common.enums.EvidenceType;
import com.sih.sociosphere.complaint.Complaint;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "evidence",
        indexes = {
                @Index(name = "idx_evidence_complaint", columnList = "complaint_id"),
                @Index(name = "idx_evidence_status", columnList = "verification_status"),
                @Index(name = "idx_evidence_uploaded_at", columnList = "uploaded_at")
        }
)
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "storage_file_name", nullable = false)
    private String storageFileName;

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "evidence_type", length = 30)
    private EvidenceType evidenceType = EvidenceType.IMAGE;

    @Column(length = 1000)
    private String description;

    private Double capturedLocationLat;
    private Double capturedLocationLng;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 30)
    private EvidenceStatus verificationStatus = EvidenceStatus.PENDING;

    private String verifiedBy;
    private LocalDateTime verifiedAt;

    @Column(columnDefinition = "TEXT")
    private String verificationNote;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
        if (evidenceType == null) evidenceType = EvidenceType.IMAGE;
        if (verificationStatus == null) verificationStatus = EvidenceStatus.PENDING;
    }

    public Evidence() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getStorageFileName() { return storageFileName; }
    public void setStorageFileName(String storageFileName) { this.storageFileName = storageFileName; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public EvidenceType getEvidenceType() { return evidenceType; }
    public void setEvidenceType(EvidenceType evidenceType) { this.evidenceType = evidenceType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getCapturedLocationLat() { return capturedLocationLat; }
    public void setCapturedLocationLat(Double capturedLocationLat) { this.capturedLocationLat = capturedLocationLat; }
    public Double getCapturedLocationLng() { return capturedLocationLng; }
    public void setCapturedLocationLng(Double capturedLocationLng) { this.capturedLocationLng = capturedLocationLng; }
    public EvidenceStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(EvidenceStatus verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    public String getVerificationNote() { return verificationNote; }
    public void setVerificationNote(String verificationNote) { this.verificationNote = verificationNote; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
