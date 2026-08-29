package com.sih.sociosphere.evidence;

import com.sih.sociosphere.common.enums.EvidenceStatus;
import com.sih.sociosphere.common.enums.EvidenceType;
import java.time.LocalDateTime;

public record EvidenceResponse(
        Long id,
        Long complaintId,
        String originalFileName,
        String contentType,
        Long fileSize,
        String fileUrl,
        EvidenceType evidenceType,
        String description,
        Double capturedLocationLat,
        Double capturedLocationLng,
        EvidenceStatus verificationStatus,
        String verifiedBy,
        LocalDateTime verifiedAt,
        String verificationNote,
        LocalDateTime uploadedAt
) {}
