package com.sih.sociosphere.matching;

import com.sih.sociosphere.ai.UniversityRecommendationService;
import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.complaint.ComplaintRepository;
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