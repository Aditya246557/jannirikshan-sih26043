package com.sih.sociosphere.proposal;

import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.complaint.ComplaintRepository;
import com.sih.sociosphere.faculty.Faculty;
import com.sih.sociosphere.faculty.FacultyRepository;
import com.sih.sociosphere.student.Student;
import com.sih.sociosphere.student.StudentRepository;
import com.sih.sociosphere.university.University;
import com.sih.sociosphere.university.UniversityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final ComplaintRepository complaintRepository;
    private final UniversityRepository universityRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    public ProposalService(
            ProposalRepository proposalRepository,
            ComplaintRepository complaintRepository,
            UniversityRepository universityRepository,
            FacultyRepository facultyRepository,
            StudentRepository studentRepository
    ) {
        this.proposalRepository = proposalRepository;
        this.complaintRepository = complaintRepository;
        this.universityRepository = universityRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public Proposal create(ProposalRequest req) {
        Complaint c = complaintRepository.findById(req.complaintId()).orElseThrow();
        University u = universityRepository.findById(req.universityId()).orElseThrow();
        Faculty f = req.facultyMentorId() != null ? facultyRepository.findById(req.facultyMentorId()).orElse(null) : null;
        Student s = req.studentLeadId() != null ? studentRepository.findById(req.studentLeadId()).orElse(null) : null;

        Proposal p = new Proposal();
        p.setComplaint(c);
        p.setUniversity(u);
        p.setFacultyMentor(f);
        p.setStudentLead(s);
        p.setTitle(req.title());
        p.setAbstractText(req.abstractText());
        p.setProposedSolution(req.proposedSolution());
        p.setMethodology(req.methodology());
        p.setEstimatedBudget(req.estimatedBudget() != null ? req.estimatedBudget() : 250000.0);
        p.setEstimatedTimelineMonths(req.estimatedTimelineMonths() != null ? req.estimatedTimelineMonths() : 6);

        return proposalRepository.save(p);
    }

    public List<Proposal> getForComplaint(Long complaintId) {
        return proposalRepository.findByComplaintId(complaintId);
    }

    public List<Proposal> getByUniversity(Long universityId) {
        return proposalRepository.findByUniversityId(universityId);
    }

    public List<Proposal> getAll() {
        return proposalRepository.findAll();
    }

    public Proposal getById(Long id) {
        return proposalRepository.findById(id).orElseThrow();
    }

    @Transactional
    public Proposal updateStatus(Long id, String statusStr, String remarks) {
        Proposal p = proposalRepository.findById(id).orElseThrow();
        if (statusStr != null) {
            String norm = statusStr.trim().toUpperCase();
            if ("APPROVED".equals(norm) || "ACCEPT".equals(norm) || "ACCEPTED".equals(norm)) {
                p.setStatus(com.sih.sociosphere.common.enums.ProposalStatus.APPROVED_BY_FACULTY);
            } else if ("REJECT".equals(norm) || "REJECTED".equals(norm)) {
                p.setStatus(com.sih.sociosphere.common.enums.ProposalStatus.REJECTED);
            } else {
                try {
                    p.setStatus(com.sih.sociosphere.common.enums.ProposalStatus.valueOf(norm));
                } catch (Exception ignored) {}
            }
        }
        if (remarks != null) {
            p.setFacultyReviewRemarks(remarks);
        }
        return proposalRepository.save(p);
    }
}