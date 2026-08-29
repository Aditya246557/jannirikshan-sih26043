package com.sih.sociosphere.university;

import com.sih.sociosphere.audit.AuditService;
import com.sih.sociosphere.common.enums.ComplaintStatus;
import com.sih.sociosphere.common.enums.NotificationType;
import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.complaint.ComplaintRepository;
import com.sih.sociosphere.department.Department;
import com.sih.sociosphere.department.DepartmentRepository;
import com.sih.sociosphere.faculty.Faculty;
import com.sih.sociosphere.faculty.FacultyRepository;
import com.sih.sociosphere.notification.NotificationService;
import com.sih.sociosphere.student.Student;
import com.sih.sociosphere.student.StudentRepository;
import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UniversityService {

    private final UniversityRepository universityRepository;
    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final UserService userService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public UniversityService(
            UniversityRepository universityRepository,
            ComplaintRepository complaintRepository,
            DepartmentRepository departmentRepository,
            FacultyRepository facultyRepository,
            StudentRepository studentRepository,
            UserService userService,
            AuditService auditService,
            NotificationService notificationService
    ) {
        this.universityRepository = universityRepository;
        this.complaintRepository = complaintRepository;
        this.departmentRepository = departmentRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.userService = userService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    public University getMyUniversity(String email) {
        User user = userService.findByEmail(email);
        if (user == null) return null;
        return universityRepository.findByUserId(user.getId()).orElse(null);
    }

    public List<Complaint> getAssignedChallenges(Long universityId) {
        return complaintRepository.findByAssignedUniversityId(universityId, org.springframework.data.domain.PageRequest.of(0, 100, org.springframework.data.domain.Sort.by("createdAt").descending())).getContent();
    }

    @Transactional
    public Complaint acceptChallenge(Long challengeId, Long facultyId, String email) {
        User user = userService.findByEmail(email);
        Complaint c = complaintRepository.findById(challengeId).orElseThrow();
        c.setStatus(ComplaintStatus.IN_PROGRESS);
        if (facultyId != null) {
            c.setAssignedFacultyId(facultyId);
        }
        Complaint saved = complaintRepository.save(c);
        auditService.log("CHALLENGE_ACCEPTED", "Complaint", saved.getId(), user, "University accepted problem solving responsibility");
        notificationService.sendNotification(c.getCreatedBy(), "Problem Solving Underway!", "A university research team has accepted your challenge #" + c.getId() + " to build a working solution.", NotificationType.CHALLENGE_ACCEPTED, "/citizen/complaints/" + c.getId());
        return saved;
    }

    @Transactional
    public Complaint rejectChallenge(Long challengeId, String reason, String email) {
        User user = userService.findByEmail(email);
        Complaint c = complaintRepository.findById(challengeId).orElseThrow();
        c.setStatus(ComplaintStatus.APPROVED); // Goes back to approved pool for other universities
        c.setAssignedUniversityId(null);
        c.setResolutionRemarks("University declined: " + reason);
        Complaint saved = complaintRepository.save(c);
        auditService.log("CHALLENGE_DECLINED", "Complaint", saved.getId(), user, "University declined: " + reason);
        return saved;
    }

    public List<Faculty> getFaculty(Long universityId) {
        return facultyRepository.findByUniversityId(universityId);
    }

    public List<Student> getStudents(Long universityId) {
        return studentRepository.findByUniversityId(universityId);
    }

    public List<Department> getDepartments(Long universityId) {
        return departmentRepository.findByUniversityId(universityId);
    }
}
