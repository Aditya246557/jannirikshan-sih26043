package com.jannirikshan.search;

import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.complaint.ComplaintRepository;
import com.jannirikshan.project.Project;
import com.jannirikshan.project.ProjectRepository;
import com.jannirikshan.university.University;
import com.jannirikshan.university.UniversityRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SearchService {

    private final ComplaintRepository complaintRepository;
    private final ProjectRepository projectRepository;
    private final UniversityRepository universityRepository;

    public SearchService(
            ComplaintRepository complaintRepository,
            ProjectRepository projectRepository,
            UniversityRepository universityRepository
    ) {
        this.complaintRepository = complaintRepository;
        this.projectRepository = projectRepository;
        this.universityRepository = universityRepository;
    }

    public Map<String, Object> globalSearch(String query) {
        if (query == null || query.isBlank()) {
            return Map.of("challenges", List.of(), "projects", List.of(), "universities", List.of());
        }
        String q = query.trim().toLowerCase();

        List<Complaint> challenges = complaintRepository.findAll().stream()
                .filter(c -> (c.getTitle() != null && c.getTitle().toLowerCase().contains(q))
                        || (c.getDescription() != null && c.getDescription().toLowerCase().contains(q))
                        || (c.getDistrict() != null && c.getDistrict().toLowerCase().contains(q))
                        || (c.getCategory() != null && c.getCategory().toLowerCase().contains(q)))
                .limit(10).toList();

        List<Project> projects = projectRepository.findAll().stream()
                .filter(p -> (p.getTitle() != null && p.getTitle().toLowerCase().contains(q))
                        || (p.getTechnologyStack() != null && p.getTechnologyStack().toLowerCase().contains(q)))
                .limit(10).toList();

        List<University> universities = universityRepository.findAll().stream()
                .filter(u -> (u.getName() != null && u.getName().toLowerCase().contains(q))
                        || (u.getDistrict() != null && u.getDistrict().toLowerCase().contains(q))
                        || (u.getExpertiseAreas() != null && u.getExpertiseAreas().toLowerCase().contains(q)))
                .limit(10).toList();

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("challenges", challenges);
        resp.put("projects", projects);
        resp.put("universities", universities);
        return resp;
    }
}