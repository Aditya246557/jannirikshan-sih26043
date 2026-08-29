package com.sih.sociosphere.audit;

import com.sih.sociosphere.user.User;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    public void log(String action, String entityType, Long entityId, User performedBy, String details) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setPerformedBy(performedBy);
            if (performedBy != null) {
                log.setPerformerName(performedBy.getName());
                log.setPerformerRole(performedBy.getRole().name());
            } else {
                log.setPerformerName("System");
                log.setPerformerRole("SYSTEM");
            }
            log.setDetails(details);
            auditRepository.save(log);
        } catch (Exception ignored) {}
    }
}
