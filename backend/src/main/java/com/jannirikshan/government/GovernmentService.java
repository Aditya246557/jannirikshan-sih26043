package com.jannirikshan.government;

import com.jannirikshan.common.enums.ComplaintStatus;
import com.jannirikshan.common.enums.Priority;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.complaint.ComplaintRepository;
import com.jannirikshan.complaint.ComplaintResponse;
import com.jannirikshan.complaint.ComplaintService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class GovernmentService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintService complaintService;

    public record GovernmentStats(
            long totalComplaints,
            long pending,
            long inProgress,
            long resolved
    ) {}

    public GovernmentService(ComplaintRepository complaintRepository, ComplaintService complaintService) {
        this.complaintRepository = complaintRepository;
        this.complaintService = complaintService;
    }

    public GovernmentStats getStats() {
        return new GovernmentStats(
                complaintRepository.count(),
                complaintRepository.countByStatus(ComplaintStatus.SUBMITTED),
                complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS),
                complaintRepository.countByStatus(ComplaintStatus.COMPLETED) + complaintRepository.countByStatus(ComplaintStatus.RESOLVED)
        );
    }

    public Page<ComplaintResponse> getComplaints(String keyword, ComplaintStatus status, Priority priority, int page, int size) {
        return complaintService.filterChallenges(keyword, null, null, status, priority, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    public ComplaintResponse updateStatus(Long id, ComplaintStatus status, String remarks) {
        Complaint c = complaintRepository.findById(id).orElseThrow();
        c.setStatus(status);
        if (remarks != null && !remarks.isBlank()) {
            c.setResolutionRemarks(remarks);
        }
        complaintRepository.save(c);
        return complaintService.get(id);
    }

    public ComplaintResponse assign(Long id, Long deptId, Long officerId) {
        Complaint c = complaintRepository.findById(id).orElseThrow();
        c.setAssignedDepartmentId(deptId);
        c.setAssignedOfficerId(officerId);
        c.setStatus(ComplaintStatus.ASSIGNED);
        complaintRepository.save(c);
        return complaintService.get(id);
    }
}