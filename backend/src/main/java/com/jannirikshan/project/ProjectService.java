package com.jannirikshan.project;

import com.jannirikshan.audit.AuditService;
import com.jannirikshan.common.enums.ComplaintStatus;
import com.jannirikshan.common.enums.MilestoneStatus;
import com.jannirikshan.common.enums.NotificationType;
import com.jannirikshan.common.enums.ProjectStage;
import com.jannirikshan.common.enums.ProjectStatus;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.complaint.ComplaintRepository;
import com.jannirikshan.faculty.Faculty;
import com.jannirikshan.faculty.FacultyRepository;
import com.jannirikshan.milestone.Milestone;
import com.jannirikshan.milestone.MilestoneRepository;
import com.jannirikshan.notification.NotificationService;
import com.jannirikshan.team.Team;
import com.jannirikshan.team.TeamMember;
import com.jannirikshan.team.TeamMemberRepository;
import com.jannirikshan.team.TeamRepository;
import com.jannirikshan.university.University;
import com.jannirikshan.university.UniversityRepository;
import com.jannirikshan.user.User;
import com.jannirikshan.user.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ComplaintRepository complaintRepository;
    private final UniversityRepository universityRepository;
    private final FacultyRepository facultyRepository;
    private final MilestoneRepository milestoneRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final com.jannirikshan.student.StudentRepository studentRepository;
    private final com.jannirikshan.task.TaskRepository taskRepository;
    private final UserService userService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public ProjectService(
            ProjectRepository projectRepository,
            ComplaintRepository complaintRepository,
            UniversityRepository universityRepository,
            FacultyRepository facultyRepository,
            MilestoneRepository milestoneRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            com.jannirikshan.student.StudentRepository studentRepository,
            com.jannirikshan.task.TaskRepository taskRepository,
            UserService userService,
            AuditService auditService,
            NotificationService notificationService
    ) {
        this.projectRepository = projectRepository;
        this.complaintRepository = complaintRepository;
        this.universityRepository = universityRepository;
        this.facultyRepository = facultyRepository;
        this.milestoneRepository = milestoneRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.studentRepository = studentRepository;
        this.taskRepository = taskRepository;
        this.userService = userService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Project createProject(
            Long complaintId,
            Long universityId,
            Long facultyMentorId,
            String title,
            String objective,
            String solutionDescription,
            String technologyStack,
            Double estimatedCost,
            Integer timelineMonths,
            String email
    ) {
        User user = userService.findByEmail(email);
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));
        University university = universityRepository.findById(universityId)
                .orElseThrow(() -> new IllegalArgumentException("University not found"));

        Faculty mentor = null;
        if (facultyMentorId != null) {
            mentor = facultyRepository.findById(facultyMentorId).orElse(null);
        }

        Project p = new Project();
        p.setComplaint(complaint);
        p.setUniversity(university);
        p.setFacultyMentor(mentor);
        p.setTitle(title != null ? title.trim() : complaint.getTitle());
        p.setObjective(objective);
        p.setSolutionDescription(solutionDescription);
        p.setTechnologyStack(technologyStack);
        p.setEstimatedCost(estimatedCost != null ? estimatedCost : 250000.0);
        p.setTimelineMonths(timelineMonths != null ? timelineMonths : 6);
        p.setStage(ProjectStage.RESEARCH);
        p.setStatus(ProjectStatus.ACTIVE);
        p.setProgressPercentage(10);
        p.setStartDate(LocalDate.now());
        p.setTargetCompletionDate(LocalDate.now().plusMonths(p.getTimelineMonths()));

        Project saved = projectRepository.save(p);

        // Update challenge status
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaintRepository.save(complaint);

        // Increment active projects on university
        university.setActiveProjectsCount(university.getActiveProjectsCount() + 1);
        universityRepository.save(university);

        // Auto-create default milestones
        createDefaultMilestones(saved);

        // Auto-create default team
        Team defaultTeam = new Team();
        defaultTeam.setProject(saved);
        defaultTeam.setName("Project Core Innovation Team");
        Team savedTeam = teamRepository.save(defaultTeam);

        // Attach student lead from this university if available
        List<com.jannirikshan.student.Student> students = studentRepository.findByUniversityId(university.getId());
        if (!students.isEmpty()) {
            com.jannirikshan.student.Student leadStudent = students.get(0);
            TeamMember tm = new TeamMember();
            tm.setTeam(savedTeam);
            tm.setStudent(leadStudent);
            tm.setRoleInTeam("Student Team Lead");
            tm.setStatus("ACTIVE");
            teamMemberRepository.save(tm);
            savedTeam.setTotalMembers(1);
            teamRepository.save(savedTeam);
        }

        auditService.log("PROJECT_CREATED", "Project", saved.getId(), user, "Project started: " + saved.getTitle());
        notificationService.sendNotification(complaint.getCreatedBy(), "Project Underway!", "An active engineering project has been initiated for challenge #" + complaint.getId() + ": " + saved.getTitle(), NotificationType.PROJECT_CREATED, "/citizen/complaints/" + complaint.getId());

        return saved;
    }

    private void createDefaultMilestones(Project project) {
        List<String> titles = List.of(
                "Phase 1: Field Scoping, Baseline Measurements & User Interviews",
                "Phase 2: System Architecture Design & Component Sourcing",
                "Phase 3: Hardware / Software Functional Prototype Assembly",
                "Phase 4: Laboratory & Field Testing / Quality Validation",
                "Phase 5: Community Pilot Deployment & Societal Impact Handover"
        );

        for (int i = 0; i < titles.size(); i++) {
            Milestone m = new Milestone();
            m.setProject(project);
            m.setMilestoneOrder(i + 1);
            m.setTitle(titles.get(i));
            m.setDescription("Core milestone deliverables for " + titles.get(i));
            m.setTargetDate(LocalDate.now().plusMonths((i + 1)));
            m.setStatus(i == 0 ? com.jannirikshan.common.enums.MilestoneStatus.IN_PROGRESS : com.jannirikshan.common.enums.MilestoneStatus.PENDING);
            m.setProgressPercentage(i == 0 ? 30 : 0);
            Milestone savedM = milestoneRepository.save(m);

            if (i == 0) {
                // Attach initial sprint tasks for student team
                com.jannirikshan.task.Task t1 = new com.jannirikshan.task.Task();
                t1.setProject(project);
                t1.setMilestone(savedM);
                t1.setTitle("On-site topographical survey and civic impact assessment");
                t1.setDescription("Conduct physical survey of reported location and interview local residents.");
                t1.setPriority(com.jannirikshan.common.enums.Priority.HIGH);
                t1.setStatus(com.jannirikshan.common.enums.TaskStatus.IN_PROGRESS);
                t1.setDueDate(LocalDate.now().plusDays(7));
                taskRepository.save(t1);

                com.jannirikshan.task.Task t2 = new com.jannirikshan.task.Task();
                t2.setProject(project);
                t2.setMilestone(savedM);
                t2.setTitle("Hardware bill of materials and IoT sensor procurement");
                t2.setDescription("Finalize embedded telemetry components, microcontroller, and communication module.");
                t2.setPriority(com.jannirikshan.common.enums.Priority.MEDIUM);
                t2.setStatus(com.jannirikshan.common.enums.TaskStatus.TODO);
                t2.setDueDate(LocalDate.now().plusDays(14));
                taskRepository.save(t2);

                com.jannirikshan.task.Task t3 = new com.jannirikshan.task.Task();
                t3.setProject(project);
                t3.setMilestone(savedM);
                t3.setTitle("Municipal safety protocol and clearance checklist verification");
                t3.setDescription("Obtain initial clearance from local municipal body for prototype testing.");
                t3.setPriority(com.jannirikshan.common.enums.Priority.LOW);
                t3.setStatus(com.jannirikshan.common.enums.TaskStatus.COMPLETED);
                t3.setDueDate(LocalDate.now().minusDays(1));
                taskRepository.save(t3);
            }
        }
    }

    public Project getProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }

    public List<Project> getUniversityProjects(Long universityId) {
        return projectRepository.findByUniversityIdOrderByIdDesc(universityId);
    }

    public List<Project> getMentorProjects(Long facultyMentorId) {
        return projectRepository.findByFacultyMentorIdOrderByIdDesc(facultyMentorId);
    }

    public List<Project> getMyProjects(String email) {
        User user = userService.findByEmail(email);
        if (user != null && user.getRole() == com.jannirikshan.common.enums.UserRole.FACULTY) {
            Optional<Faculty> faculty = facultyRepository.findByUserId(user.getId());
            if (faculty.isPresent()) {
                return projectRepository.findByFacultyMentorIdOrderByIdDesc(faculty.get().getId());
            }
            return List.of();
        } else if (user != null && user.getRole() == com.jannirikshan.common.enums.UserRole.UNIVERSITY) {
            Optional<University> univ = universityRepository.findByUserId(user.getId());
            if (univ.isPresent()) {
                return projectRepository.findByUniversityIdOrderByIdDesc(univ.get().getId());
            }
            return List.of();
        } else if (user != null && user.getRole() == com.jannirikshan.common.enums.UserRole.STUDENT) {
            Optional<com.jannirikshan.student.Student> student = studentRepository.findByUserId(user.getId());
            if (student.isPresent() && student.get().getUniversity() != null) {
                return projectRepository.findByUniversityIdOrderByIdDesc(student.get().getUniversity().getId());
            }
            return List.of();
        }
        return projectRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));
    }

    public Project getByComplaintId(Long complaintId) {
        return projectRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("No project associated with challenge #" + complaintId));
    }

    public Page<Project> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable);
    }

    @Transactional
    public Project updateStage(Long projectId, ProjectStage newStage, Integer progress, String notes, String email) {
        User user = email != null ? userService.findByEmail(email) : null;
        Project p = getProject(projectId);
        p.setStage(newStage != null ? newStage : ProjectStage.DEVELOPMENT);
        
        // Progress is milestone-driven: ALWAYS compute from the 5 project milestones
        List<Milestone> projectMilestones = milestoneRepository.findByProjectIdOrderByMilestoneOrderAsc(projectId);
        if (!projectMilestones.isEmpty()) {
            double avg = projectMilestones.stream().mapToInt(Milestone::getProgressPercentage).average().orElse(0.0);
            p.setProgressPercentage((int) Math.round(avg));
        } else if (progress != null) {
            p.setProgressPercentage(progress);
        } else if (p.getProgressPercentage() == null) {
            p.setProgressPercentage(0);
        }
        
        if (notes != null) p.setDeploymentNotes(notes);

        if (p.getComplaint() != null) {
            boolean allApproved = !projectMilestones.isEmpty() && projectMilestones.stream().allMatch(ms -> ms.getStatus() == MilestoneStatus.APPROVED);
            if (newStage == ProjectStage.IMPACT && allApproved) {
                p.setStatus(ProjectStatus.COMPLETED);
                p.setActualCompletionDate(LocalDate.now());
                Complaint c = p.getComplaint();
                c.setStatus(ComplaintStatus.COMPLETED);
                c.setResolutionRemarks(notes != null ? notes : "Project engineering successfully completed and community impact verified.");
                complaintRepository.save(c);
                auditService.log("COMPLAINT_STAGE_ADVANCED", "Complaint", c.getId(), user, "Advanced to Stage 6 (IMPACT) upon Project #" + p.getId() + " impact handover.");
            }
        }

        Project saved = projectRepository.save(p);
        auditService.log("PROJECT_STAGE_UPDATED", "Project", saved.getId(), user, "Stage progressed to " + newStage);
        return saved;
    }
}
