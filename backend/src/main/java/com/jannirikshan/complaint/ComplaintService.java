package com.jannirikshan.complaint;

import com.jannirikshan.ai.PriorityPredictionService;
import com.jannirikshan.ai.UniversityRecommendationService;
import com.jannirikshan.audit.AuditService;
import com.jannirikshan.common.enums.ComplaintStatus;
import com.jannirikshan.common.enums.NotificationType;
import com.jannirikshan.common.enums.Priority;
import com.jannirikshan.faculty.Faculty;
import com.jannirikshan.faculty.FacultyRepository;
import com.jannirikshan.notification.NotificationService;
import com.jannirikshan.university.University;
import com.jannirikshan.university.UniversityRepository;
import com.jannirikshan.user.User;
import com.jannirikshan.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class ComplaintService {

    private final ComplaintRepository repository;
    private final UserService userService;
    private final UniversityRepository universityRepository;
    private final FacultyRepository facultyRepository;
    private final PriorityPredictionService priorityPredictionService;
    private final UniversityRecommendationService universityRecommendationService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public ComplaintService(
            ComplaintRepository repository,
            UserService userService,
            UniversityRepository universityRepository,
            FacultyRepository facultyRepository,
            PriorityPredictionService priorityPredictionService,
            UniversityRecommendationService universityRecommendationService,
            AuditService auditService,
            NotificationService notificationService
    ) {
        this.repository = repository;
        this.userService = userService;
        this.universityRepository = universityRepository;
        this.facultyRepository = facultyRepository;
        this.priorityPredictionService = priorityPredictionService;
        this.universityRecommendationService = universityRecommendationService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ComplaintResponse create(ComplaintRequest request, String email) {
        User user = userService.findByEmail(email);

        Complaint c = new Complaint();
        c.setTitle(request.title().trim());
        c.setDescription(request.description().trim());
        
        String cat = request.category() != null ? request.category().trim() : "";
        if (cat.isBlank()) {
            cat = request.citizenSuggestedCategory() != null && !request.citizenSuggestedCategory().isBlank()
                    ? request.citizenSuggestedCategory().trim()
                    : "Pending AI Verification";
        }
        c.setCategory(cat);
        c.setCitizenSuggestedCategory(request.citizenSuggestedCategory() != null ? request.citizenSuggestedCategory().trim() : null);
        c.setSubcategory(request.subcategory() != null ? request.subcategory().trim() : "");
        c.setProblemType(request.problemType() != null ? request.problemType().trim() : "Societal Challenge");
        c.setSeverity(request.severity() != null ? request.severity() : Priority.MEDIUM);
        c.setAffectedPeople(request.affectedPeople() != null ? request.affectedPeople() : 100);
        c.setExpectedImpact(request.expectedImpact());
        c.setDesiredEngineeringOutcome(request.desiredEngineeringOutcome() != null ? request.desiredEngineeringOutcome() : request.expectedImpact());
        c.setContactInfo(request.contactInfo());
        c.setLatitude(request.latitude());
        c.setLongitude(request.longitude());
        c.setAddress(request.address());
        c.setVillageCity(request.villageCity());
        c.setBlock(request.block());
        c.setDistrict(request.district());
        c.setState(request.state());
        c.setCreatedBy(user);
        c.setStatus(ComplaintStatus.SUBMITTED);

        // Auto Rule-Based Priority Calculation
        Map<String, Object> prioResult = priorityPredictionService.calculatePriority(
                c.getSeverity(),
                c.getAffectedPeople(),
                c.getCategory(),
                c.getDescription()
        );
        c.setPriorityScore((Double) prioResult.get("priorityScore"));
        c.setPriority(Priority.valueOf(prioResult.get("priorityLevel").toString()));
        c.setPriorityBreakdownJson(prioResult.get("breakdown").toString());

        Complaint saved = repository.save(c);
        auditService.log("CHALLENGE_SUBMITTED", "Complaint", saved.getId(), user, "Citizen submitted challenge: " + saved.getTitle());
        notificationService.sendNotification(user, "Challenge Submitted", "Your societal challenge #" + saved.getId() + " has been received and is pending verification.", NotificationType.CHALLENGE_SUBMITTED, "/citizen/complaints/" + saved.getId());

        return map(saved);
    }

    @Transactional(readOnly = true)
    public ComplaintResponse get(Long id) {
        return repository.findById(id).map(this::map).orElseThrow(() -> new IllegalArgumentException("Challenge not found."));
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getMine(String email, Pageable pageable) {
        User user = userService.findByEmail(email);
        return repository.findByCreatedById(user.getId(), pageable).map(this::map);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> search(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return repository.findAll(pageable).map(this::map);
        }
        String val = keyword.trim();
        return repository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(val, val, pageable).map(this::map);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> filterChallenges(
            String keyword,
            String category,
            String district,
            ComplaintStatus status,
            Priority priority,
            Pageable pageable
    ) {
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        String cat = (category != null && !category.isBlank()) ? category.trim() : null;
        String dist = (district != null && !district.isBlank()) ? district.trim() : null;
        if (kw == null && cat == null && dist == null && status == null && priority == null) {
            return repository.findAll(pageable).map(this::map);
        }
        return repository.filterChallenges(kw, cat, dist, status, priority, pageable).map(this::map);
    }

    @Transactional
    public ComplaintResponse review(Long id, boolean approved, String remarks, User adminUser) {
        Complaint c = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge not found."));
        if (approved) {
            c.setStatus(ComplaintStatus.APPROVED);
            c.setResolutionRemarks(remarks != null && !remarks.isBlank() ? remarks.trim() : "Problem verified and approved for university problem-solving.");
            auditService.log("CHALLENGE_APPROVED", "Complaint", c.getId(), adminUser, "Approved by Admin: " + c.getTitle());
            notificationService.sendNotification(c.getCreatedBy(), "Challenge Approved! 🎉", "Your challenge #" + c.getId() + " has been verified and approved by the government committee.", NotificationType.CHALLENGE_APPROVED, "/citizen/complaints/" + c.getId());
        } else {
            if (remarks == null || remarks.isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required.");
            }
            c.setStatus(ComplaintStatus.REJECTED);
            c.setRejectionReason(remarks.trim());
            c.setResolutionRemarks(remarks.trim());
            auditService.log("CHALLENGE_REJECTED", "Complaint", c.getId(), adminUser, "Rejected with reason: " + remarks);
            notificationService.sendNotification(c.getCreatedBy(), "Challenge Update", "Your challenge #" + c.getId() + " was reviewed: " + remarks, NotificationType.CHALLENGE_REJECTED, "/citizen/complaints/" + c.getId());
        }
        return map(repository.save(c));
    }

    @Transactional
    public ComplaintResponse requestClarification(Long id, String requestMessage, User adminUser) {
        Complaint c = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge not found."));
        c.setStatus(ComplaintStatus.CLARIFICATION_REQUIRED);
        c.setClarificationRequest(requestMessage);
        auditService.log("CLARIFICATION_REQUESTED", "Complaint", c.getId(), adminUser, "Clarification asked: " + requestMessage);
        notificationService.sendNotification(c.getCreatedBy(), "Clarification Requested", "Government review committee requested more details on challenge #" + c.getId() + ": " + requestMessage, NotificationType.CLARIFICATION_REQUESTED, "/citizen/complaints/" + c.getId());
        return map(repository.save(c));
    }

    @Transactional
    public ComplaintResponse submitClarification(Long id, String responseMessage, String email) {
        User user = userService.findByEmail(email);
        Complaint c = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge not found."));
        c.setClarificationResponse(responseMessage);
        c.setStatus(ComplaintStatus.UNDER_REVIEW);
        auditService.log("CLARIFICATION_PROVIDED", "Complaint", c.getId(), user, "Citizen responded to clarification");
        return map(repository.save(c));
    }

    @Transactional
    public ComplaintResponse changePriority(Long id, Priority newPriority, Double score, User adminUser) {
        Complaint c = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge not found."));
        Priority oldP = c.getPriority();
        c.setPriority(newPriority);
        if (score != null) c.setPriorityScore(score);
        c.setPriorityManuallyOverridden(true);
        auditService.log("PRIORITY_OVERRIDE", "Complaint", c.getId(), adminUser, "Priority changed " + oldP + " -> " + newPriority + " (Score: " + c.getPriorityScore() + ")");
        return map(repository.save(c));
    }

    @Transactional
    public ComplaintResponse changeCategory(Long id, String newCategory, User adminUser) {
        Complaint c = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge not found."));
        String oldC = c.getCategory();
        c.setCategory(newCategory);
        auditService.log("CATEGORY_CHANGED", "Complaint", c.getId(), adminUser, "Category changed " + oldC + " -> " + newCategory);
        return map(repository.save(c));
    }

    @Transactional
    public ComplaintResponse assignUniversity(Long id, Long universityId, Long departmentId, Long facultyId, User adminUser) {
        Complaint c = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge not found."));

        University u;
        if (universityId == null || universityId <= 0) {
            Map<String, Object> matchDetails = universityRecommendationService.getUniversityMatchDetails(c);
            Long matchedId = Long.parseLong(matchDetails.get("bestUniversityId").toString());
            u = universityRepository.findById(matchedId)
                    .orElseThrow(() -> new IllegalArgumentException("AI matched university not found: " + matchedId));

            c.setAiMatchedUniversityId(u.getId());
            c.setAiMatchedUniversityName(u.getName());
            if (matchDetails.get("matchScore") != null) {
                c.setAiMatchScore(Double.parseDouble(matchDetails.get("matchScore").toString()));
            }
            if (matchDetails.get("reason") != null) {
                c.setAiMatchReason(matchDetails.get("reason").toString());
            }
        } else {
            u = universityRepository.findById(universityId)
                    .orElseThrow(() -> new IllegalArgumentException("University not found: " + universityId));
        }

        c.setAssignedUniversityId(u.getId());
        if (departmentId != null) c.setAssignedDepartmentId(departmentId);
        if (facultyId != null) c.setAssignedFacultyId(facultyId);
        c.setStatus(ComplaintStatus.ASSIGNED);

        auditService.log("AI_UNIVERSITY_ASSIGNED", "Complaint", c.getId(), adminUser, "AI Auto-Assigned to Premier University: " + u.getName() + (c.getAiMatchScore() != null ? " (Match Score: " + Math.round(c.getAiMatchScore()) + "%)" : ""));
        if (u.getUser() != null) {
            notificationService.sendNotification(u.getUser(), "New Challenge Assigned", "Challenge #" + c.getId() + " has been assigned to your institution: " + c.getTitle(), NotificationType.UNIVERSITY_ASSIGNED, "/university/assigned-challenges");
        }
        return map(repository.save(c));
    }

    @Transactional
    public ComplaintResponse update(Long id, ComplaintRequest request, String email) {
        User user = userService.findByEmail(email);
        Complaint c = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge not found."));

        if (!user.getId().equals(c.getCreatedBy().getId())) {
            throw new IllegalStateException("Access denied.");
        }

        c.setTitle(request.title().trim());
        c.setDescription(request.description().trim());
        c.setCategory(request.category().trim());
        if (request.subcategory() != null) c.setSubcategory(request.subcategory().trim());
        if (request.problemType() != null) c.setProblemType(request.problemType().trim());
        if (request.expectedImpact() != null) c.setExpectedImpact(request.expectedImpact());
        if (request.contactInfo() != null) c.setContactInfo(request.contactInfo());
        c.setLatitude(request.latitude());
        c.setLongitude(request.longitude());
        c.setAddress(request.address());

        return map(repository.save(c));
    }

    @Transactional
    public void cancel(Long id, String email) {
        User user = userService.findByEmail(email);
        Complaint c = repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Challenge not found."));
        if (!user.getId().equals(c.getCreatedBy().getId())) {
            throw new IllegalStateException("Access denied.");
        }
        c.setStatus(ComplaintStatus.CLOSED);
        repository.save(c);
    }

    private ComplaintResponse map(Complaint c) {
        User user = c.getCreatedBy();
        String uName = null;
        if (c.getAssignedUniversityId() != null) {
            uName = universityRepository.findById(c.getAssignedUniversityId()).map(University::getName).orElse(null);
        }
        String fName = null;
        if (c.getAssignedFacultyId() != null) {
            fName = facultyRepository.findById(c.getAssignedFacultyId()).map(f -> f.getUser().getName()).orElse(null);
        }

        return new ComplaintResponse(
                c.getId(),
                c.getTitle(),
                c.getDescription(),
                c.getCategory(),
                c.getSubcategory(),
                c.getProblemType(),
                c.getSeverity(),
                c.getAffectedPeople(),
                c.getExpectedImpact(),
                c.getDesiredEngineeringOutcome(),
                c.getContactInfo(),
                c.getPriority(),
                c.getPriorityScore(),
                c.getPriorityBreakdownJson(),
                c.isPriorityManuallyOverridden(),
                c.getStatus(),
                c.getLatitude(),
                c.getLongitude(),
                c.getAddress(),
                c.getVillageCity(),
                c.getBlock(),
                c.getDistrict(),
                c.getState(),
                user != null ? user.getId() : null,
                user != null ? user.getName() : null,
                c.getAssignedUniversityId(),
                uName,
                c.getAssignedDepartmentId(),
                c.getAssignedFacultyId(),
                fName,
                c.isDuplicate(),
                c.getMasterChallengeId(),
                c.getRejectionReason(),
                c.getClarificationRequest(),
                c.getClarificationResponse(),
                c.getResolutionRemarks(),
                c.getAiDetectedClass(),
                c.getAiCategory(),
                c.getAiRecommendedDepartment(),
                c.getCitizenSuggestedCategory(),
                c.isAiMismatch(),
                c.getAiMismatchWarning(),
                c.getAiPriority(),
                c.getAiConfidence(),
                c.getAiDomain(),
                c.getAiDomainConfidence(),
                c.getAiCivicIssue(),
                c.getAiCivicIssueConfidence(),
                c.getAiBoundingBoxes(),
                c.getAiDuplicateScore(),
                c.getAiClusterId(),
                c.getAiClusterSize(),
                c.getAiMatchedUniversityId(),
                c.getAiMatchedUniversityName() != null ? c.getAiMatchedUniversityName() : uName,
                c.getAiMatchScore(),
                c.getAiMatchReason(),
                c.getAiRankedCandidatesJson(),
                c.getAiModelVersion(),
                c.getAiProcessedAt(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
