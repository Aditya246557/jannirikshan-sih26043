package com.jannirikshan.milestone;

import com.jannirikshan.audit.AuditService;
import com.jannirikshan.common.enums.ComplaintStatus;
import com.jannirikshan.common.enums.MilestoneStatus;
import com.jannirikshan.common.enums.NotificationType;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.complaint.ComplaintRepository;
import com.jannirikshan.notification.NotificationService;
import com.jannirikshan.project.Project;
import com.jannirikshan.project.ProjectRepository;
import com.jannirikshan.user.User;
import com.jannirikshan.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final ComplaintRepository complaintRepository;
    private final UserService userService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public MilestoneService(
            MilestoneRepository milestoneRepository,
            ProjectRepository projectRepository,
            ComplaintRepository complaintRepository,
            UserService userService,
            AuditService auditService,
            NotificationService notificationService
    ) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
        this.complaintRepository = complaintRepository;
        this.userService = userService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public List<Milestone> getByProject(Long projectId) {
        return milestoneRepository.findByProjectIdOrderByMilestoneOrderAsc(projectId);
    }

    @Transactional
    public Milestone create(Long projectId, String title, String description, LocalDate targetDate, Integer order) {
        Project p = projectRepository.findById(projectId).orElseThrow();
        Milestone m = new Milestone();
        m.setProject(p);
        m.setTitle(title);
        m.setDescription(description);
        m.setTargetDate(targetDate != null ? targetDate : LocalDate.now().plusMonths(1));
        m.setMilestoneOrder(order != null ? order : 1);
        m.setStatus(MilestoneStatus.PENDING);
        return milestoneRepository.save(m);
    }

    @Transactional
    public Milestone submitForReview(Long milestoneId, String deliverables, String submissionNotes, String email) {
        User user = userService.findByEmail(email);
        Milestone m = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));

        if (m.getStatus() == MilestoneStatus.APPROVED) {
            throw new IllegalStateException("Milestone M" + (m.getMilestoneOrder() != null ? m.getMilestoneOrder() : "") + " is already approved and cannot be re-submitted.");
        }

        // Validate that all preceding milestones are APPROVED
        List<Milestone> projectMilestones = milestoneRepository.findByProjectIdOrderByMilestoneOrderAsc(m.getProject().getId());
        for (Milestone prev : projectMilestones) {
            if (prev.getMilestoneOrder() < m.getMilestoneOrder() && prev.getStatus() != MilestoneStatus.APPROVED) {
                throw new IllegalStateException("Previous milestone 'M" + prev.getMilestoneOrder() + ": " + prev.getTitle() + "' must be approved before submitting this milestone.");
            }
        }

        m.setDeliverablesJson(deliverables);
        m.setStudentSubmissionNotes(submissionNotes);
        m.setStatus(MilestoneStatus.SUBMITTED_FOR_REVIEW);

        Milestone saved = milestoneRepository.save(m);
        auditService.log("MILESTONE_SUBMITTED", "Milestone", saved.getId(), user, "Student submitted milestone: " + m.getTitle());
        return saved;
    }

    @Transactional
    public Milestone reviewMilestone(Long milestoneId, boolean approved, String feedback, String email) {
        User facultyUser = userService.findByEmail(email);
        Milestone m = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));
        m.setFacultyFeedback(feedback);

        if (approved) {
            m.setStatus(MilestoneStatus.APPROVED);
            m.setProgressPercentage(100);
            m.setCompletionDate(LocalDate.now());
            m.setApprovedByFacultyName(facultyUser != null ? facultyUser.getName() : "Faculty Mentor");
            m.setApprovedAt(LocalDateTime.now());
        } else {
            m.setStatus(MilestoneStatus.REJECTED);
            m.setProgressPercentage(0);
        }

        Milestone saved = milestoneRepository.save(m);

        // Recalculate project progress strictly from all milestones: (sum of all milestone progress) / count
        List<Milestone> all = milestoneRepository.findByProjectIdOrderByMilestoneOrderAsc(m.getProject().getId());
        double avg = all.stream().mapToInt(Milestone::getProgressPercentage).average().orElse(0.0);
        Project p = m.getProject();
        int progress = (int) Math.round(avg);
        p.setProgressPercentage(progress);

        // When all milestones are approved and project reaches 100%, advance parent complaint to Stage 5: R&D_PROTOTYPE (PROTOTYPE)
        boolean allMilestonesApproved = !all.isEmpty() && all.stream().allMatch(ms -> ms.getStatus() == MilestoneStatus.APPROVED);
        if (allMilestonesApproved && p.getComplaint() != null) {
            Complaint c = p.getComplaint();
            if (c.getStatus() == ComplaintStatus.IN_PROGRESS || c.getStatus() == ComplaintStatus.ASSIGNED) {
                c.setStatus(ComplaintStatus.PROTOTYPE);
                c.setResolutionRemarks("R&D milestones (M1–M5) 100% completed and approved by Faculty Mentor. Functional prototype validated.");
                complaintRepository.save(c);
                auditService.log("COMPLAINT_STAGE_ADVANCED", "Complaint", c.getId(), facultyUser, "Advanced to Stage 5 (R&D_PROTOTYPE) following 100% milestone completion of Project #" + p.getId());
                if (c.getCreatedBy() != null) {
                    notificationService.sendNotification(c.getCreatedBy(), "R&D Prototype Ready! 🚀", "The university engineering team has completed all milestones for challenge #" + c.getId() + ". Prototype is now verified.", NotificationType.MILESTONE_APPROVED, "/citizen/complaints/" + c.getId());
                }
            }
        }

        projectRepository.save(p);

        auditService.log(approved ? "MILESTONE_APPROVED" : "MILESTONE_REJECTED", "Milestone", saved.getId(), facultyUser, "Faculty review: " + (approved ? "APPROVED" : "REJECTED"));
        return saved;
    }
}
