package com.jannirikshan.matching;

import com.jannirikshan.ai.UniversityRecommendationService;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.complaint.ComplaintRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class MatchingService {
    private final UniversityRecommendationService universityRecommendationService;
    private final ComplaintRepository complaintRepository;

    public MatchingService(UniversityRecommendationService universityRecommendationService, ComplaintRepository complaintRepository) {
        this.universityRecommendationService = universityRecommendationService;
        this.complaintRepository = complaintRepository;
    }

    public List<Map<String, Object>> match(Long complaintId) {
        Complaint c = complaintRepository.findById(complaintId).orElseThrow();
        return universityRecommendationService.recommendUniversities(c);
    }
}