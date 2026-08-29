package com.sih.sociosphere.industry;

import com.sih.sociosphere.audit.AuditService;
import com.sih.sociosphere.common.enums.FundingStatus;
import com.sih.sociosphere.common.enums.NotificationType;
import com.sih.sociosphere.common.enums.PartnershipStatus;
import com.sih.sociosphere.common.enums.PartnershipType;
import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.complaint.ComplaintRepository;
import com.sih.sociosphere.notification.NotificationService;
import com.sih.sociosphere.project.Funding;
import com.sih.sociosphere.project.FundingRepository;
import com.sih.sociosphere.project.Project;
import com.sih.sociosphere.project.ProjectRepository;
import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class IndustryService {

    private final IndustryRepository industryRepository;
    private final IndustryPartnershipRepository partnershipRepository;
    private final ProjectRepository projectRepository;
    private final ComplaintRepository complaintRepository;
    private final FundingRepository fundingRepository;
    private final UserService userService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public IndustryService(
            IndustryRepository industryRepository,
            IndustryPartnershipRepository partnershipRepository,
            ProjectRepository projectRepository,
            ComplaintRepository complaintRepository,
            FundingRepository fundingRepository,
            UserService userService,
            AuditService auditService,
            NotificationService notificationService
    ) {
        this.industryRepository = industryRepository;
        this.partnershipRepository = partnershipRepository;
        this.projectRepository = projectRepository;
        this.complaintRepository = complaintRepository;
        this.fundingRepository = fundingRepository;
        this.userService = userService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public Industry getMyIndustry(String email) {
        User user = userService.findByEmail(email);
        return industryRepository.findByUserId(user.getId())
                .orElseGet(() -> industryRepository.findAll().stream().findFirst().orElse(null));
    }

    @Transactional
    public IndustryPartnership expressInterest(
            Long projectId,
            Long challengeId,
            PartnershipType type,
            Double fundingAmount,
            String mentorshipScope,
            String techResources,
            String proposalDetails,
            String email
    ) {
        User user = userService.findByEmail(email);
        Industry industry = getMyIndustry(email);

        Project project = projectId != null ? projectRepository.findById(projectId).orElse(null) : null;
        Complaint challenge = challengeId != null ? complaintRepository.findById(challengeId).orElse(null) : null;
        if (project != null && challenge == null) {
            challenge = project.getComplaint();
        }

        PartnershipType effType = type != null ? type : PartnershipType.CSR_SPONSORSHIP;
        Double effAmount = fundingAmount != null ? fundingAmount : 0.0;

        IndustryPartnership p = new IndustryPartnership();
        p.setIndustry(industry);
        p.setProject(project);
        p.setChallenge(challenge);
        p.setPartnershipType(effType);
        p.setStatus(PartnershipStatus.OFFERED);
        p.setFundingAmount(effAmount);
        p.setMentorshipScope(mentorshipScope);
        p.setTechnologyResourcesOffered(techResources);
        p.setProposalDetails(proposalDetails);

        IndustryPartnership saved = partnershipRepository.save(p);
        auditService.log("INDUSTRY_OFFER_SUBMITTED", "IndustryPartnership", saved.getId(), user,
                "Offered " + effType + " of ₹" + p.getFundingAmount() + " by " + (industry != null ? industry.getCompanyName() : "Industry Partner"));

        if (project != null && project.getUniversity() != null && project.getUniversity().getUser() != null) {
            notificationService.sendNotification(
                    project.getUniversity().getUser(),
                    "Industry Partnership Offer!",
                    (industry != null ? industry.getCompanyName() : "Industry Partner") + " offered " + effType + " (₹" + p.getFundingAmount() + ") for project: " + project.getTitle(),
                    NotificationType.INDUSTRY_INTEREST,
                    "/university"
            );
        }

        return saved;
    }

    @Transactional
    public IndustryPartnership approvePartnership(Long partnershipId, String email) {
        User user = userService.findByEmail(email);
        IndustryPartnership p = partnershipRepository.findById(partnershipId).orElseThrow();
        p.setStatus(PartnershipStatus.ACCEPTED);
        p.setApprovedBy(user != null ? user.getName() : "University Innovation Cell");
        p.setApprovedAt(LocalDateTime.now());

        Project proj = p.getProject();
        if (proj != null && p.getFundingAmount() != null && p.getFundingAmount() > 0) {
            Industry ind = p.getIndustry();
            String expectedSponsor = ind != null ? ind.getCompanyName() : "Tata CSR Innovation Trust";

            String txRef = "CSR-" + p.getPartnershipType().name() + "-" + p.getId();
            Funding targetFunding = fundingRepository.findByProjectId(proj.getId()).stream()
                    .filter(f -> txRef.equals(f.getTransactionRef()))
                    .findFirst()
                    .orElse(null);

            if (targetFunding == null) {
                targetFunding = new Funding();
                targetFunding.setProject(proj);
                targetFunding.setSponsorName(expectedSponsor);
                targetFunding.setFundingStage("CSR Sponsorship");
                targetFunding.setTransactionRef(txRef);
                targetFunding.setFundingDate(LocalDate.now());
                targetFunding.setStatus(FundingStatus.COMMITTED);
            }

            targetFunding.setAmount(p.getFundingAmount());
            targetFunding.setNote(p.getProposalDetails() != null ? p.getProposalDetails() : ("Committed " + p.getPartnershipType() + " via SIH26043 CSR Portal"));
            fundingRepository.save(targetFunding);

            // Recalculate project's current funding as sum of all active committed/disbursed funding entries
            double totalFunding = fundingRepository.findByProjectId(proj.getId()).stream()
                    .mapToDouble(f -> f.getAmount() != null ? f.getAmount() : 0.0)
                    .sum();
            proj.setCurrentFunding(totalFunding);
            projectRepository.save(proj);
        }

        // Update industry stats
        Industry ind = p.getIndustry();
        if (ind != null) {
            long count = partnershipRepository.findByIndustryId(ind.getId()).stream()
                    .filter(part -> part.getStatus() == PartnershipStatus.ACCEPTED || part.getStatus() == PartnershipStatus.ACTIVE || part.getStatus() == PartnershipStatus.COMPLETED)
                    .count();
            ind.setProjectsSupportedCount((int) count);
            double totalCommitted = partnershipRepository.findByIndustryId(ind.getId()).stream()
                    .filter(part -> part.getStatus() == PartnershipStatus.ACCEPTED || part.getStatus() == PartnershipStatus.ACTIVE || part.getStatus() == PartnershipStatus.COMPLETED)
                    .mapToDouble(part -> part.getFundingAmount() != null ? part.getFundingAmount() : 0.0)
                    .sum();
            ind.setTotalFundingCommitted(totalCommitted);
            industryRepository.save(ind);

            if (ind.getUser() != null && proj != null) {
                notificationService.sendNotification(
                        ind.getUser(),
                        "Partnership Offer Accepted!",
                        "Your collaboration offer of ₹" + p.getFundingAmount() + " for project '" + proj.getTitle() + "' was ACCEPTED by " + (proj.getUniversity() != null ? proj.getUniversity().getName() : "University"),
                        NotificationType.PARTNERSHIP_APPROVED,
                        "/industry/partnerships"
                );
            }
        }

        IndustryPartnership saved = partnershipRepository.save(p);
        auditService.log("INDUSTRY_OFFER_ACCEPTED", "IndustryPartnership", saved.getId(), user,
                "University accepted collaboration offer of ₹" + p.getFundingAmount() + " from " + (ind != null ? ind.getCompanyName() : "Industry Partner"));
        return saved;
    }

    @Transactional
    public IndustryPartnership rejectPartnership(Long partnershipId, String reason, String email) {
        User user = userService.findByEmail(email);
        IndustryPartnership p = partnershipRepository.findById(partnershipId).orElseThrow();
        p.setStatus(PartnershipStatus.REJECTED);
        p.setApprovedBy(user != null ? user.getName() : "University Innovation Cell");
        p.setApprovedAt(LocalDateTime.now());

        Project proj = p.getProject();
        if (proj != null) {
            String txRef = "CSR-" + p.getPartnershipType().name() + "-" + p.getId();
            List<Funding> matchingFundings = fundingRepository.findByProjectId(proj.getId()).stream()
                    .filter(f -> txRef.equals(f.getTransactionRef()))
                    .toList();
            fundingRepository.deleteAll(matchingFundings);

            double totalFunding = fundingRepository.findByProjectId(proj.getId()).stream()
                    .mapToDouble(f -> f.getAmount() != null ? f.getAmount() : 0.0)
                    .sum();
            proj.setCurrentFunding(totalFunding);
            projectRepository.save(proj);
        }

        Industry ind = p.getIndustry();
        if (ind != null && ind.getUser() != null && proj != null) {
            notificationService.sendNotification(
                    ind.getUser(),
                    "Partnership Offer Declined",
                    "Your collaboration offer for project '" + proj.getTitle() + "' was declined by " + (proj.getUniversity() != null ? proj.getUniversity().getName() : "the University") + (reason != null && !reason.isBlank() ? (": " + reason) : "."),
                    NotificationType.GENERAL_ALERT,
                    "/industry/partnerships"
            );
        }

        IndustryPartnership saved = partnershipRepository.save(p);
        auditService.log("INDUSTRY_OFFER_REJECTED", "IndustryPartnership", saved.getId(), user,
                "University declined collaboration offer from " + (ind != null ? ind.getCompanyName() : "Industry Partner") + (reason != null && !reason.isBlank() ? (": " + reason) : ""));
        return saved;
    }

    public List<IndustryPartnership> getPartnershipsForProject(Long projectId) {
        return partnershipRepository.findByProjectId(projectId);
    }

    public List<IndustryPartnership> getPartnershipsForUniversity(Long universityId) {
        return partnershipRepository.findByUniversityId(universityId);
    }

    public List<Funding> getFundingForProject(Long projectId) {
        return fundingRepository.findByProjectId(projectId);
    }

    public List<IndustryPartnership> getMyPartnerships(String email) {
        Industry ind = getMyIndustry(email);
        if (ind == null) return List.of();
        return partnershipRepository.findByIndustryId(ind.getId());
    }
}
