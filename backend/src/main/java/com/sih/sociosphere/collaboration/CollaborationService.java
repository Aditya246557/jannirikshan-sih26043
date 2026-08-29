package com.sih.sociosphere.collaboration;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CollaborationService {

    private final CollaborationRepository repository;

    public CollaborationService(CollaborationRepository repository) {
        this.repository = repository;
    }

    public List<Collaboration> getForComplaint(Long complaintId) {
        return repository.findByComplaintId(complaintId);
    }
}