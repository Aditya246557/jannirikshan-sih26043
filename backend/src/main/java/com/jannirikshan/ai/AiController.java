package com.jannirikshan.ai;

import com.jannirikshan.common.ApiResponse;
import com.jannirikshan.common.enums.Priority;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.complaint.ComplaintRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final ChallengeClassificationService classificationService;
    private final PriorityPredictionService priorityService;
    private final DuplicateDetectionService duplicateService;
    private final UniversityRecommendationService universityService;
    private final SolutionRecommendationService solutionService;
    private final ComplaintRepository complaintRepository;
    private final AiService aiService;

    public AiController(
            ChallengeClassificationService classificationService,
            PriorityPredictionService priorityService,
            DuplicateDetectionService duplicateService,
            UniversityRecommendationService universityService,
            SolutionRecommendationService solutionService,
            ComplaintRepository complaintRepository,
            AiService aiService
    ) {
        this.classificationService = classificationService;
        this.priorityService = priorityService;
        this.duplicateService = duplicateService;
        this.universityService = universityService;
        this.solutionService = solutionService;
        this.complaintRepository = complaintRepository;
        this.aiService = aiService;
    }

    @GetMapping("/health")
    public ResponseEntity<?> getHealth() {
        return ResponseEntity.ok(ApiResponse.success(aiService.getAiHealth()));
    }

    @PostMapping({"/validate-image", "/predict"})
    public ResponseEntity<?> validateImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(aiService.validateImage(file));
    }

    @PostMapping({"/generate-complaint-details", "/generate-details"})
    public ResponseEntity<?> generateComplaintDetails(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "variation", required = false, defaultValue = "0") Integer variation
    ) {
        return ResponseEntity.ok(aiService.generateComplaintDetails(file, location, description, variation));
    }

    @PostMapping("/classify")
    public ResponseEntity<?> classify(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                classificationService.predictCategory(body.get("title"), body.get("description"))
        ));
    }

    @PostMapping("/civic-issue")
    public ResponseEntity<?> civicIssue(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                aiService.classifyCivicIssue(body.get("text"))
        ));
    }

    @PostMapping("/duplicate")
    public ResponseEntity<?> checkDuplicate(@RequestBody Map<String, Object> body) {
        String textA = body.get("text_a") != null ? body.get("text_a").toString() : "";
        String textB = body.get("text_b") != null ? body.get("text_b").toString() : "";
        String issueA = body.get("issue_a") != null ? body.get("issue_a").toString() : "";
        String issueB = body.get("issue_b") != null ? body.get("issue_b").toString() : "";
        String locA = body.get("location_a") != null ? body.get("location_a").toString() : "";
        String locB = body.get("location_b") != null ? body.get("location_b").toString() : "";
        Double latA = body.get("lat_a") != null ? Double.parseDouble(body.get("lat_a").toString()) : null;
        Double lonA = body.get("lon_a") != null ? Double.parseDouble(body.get("lon_a").toString()) : null;
        Double latB = body.get("lat_b") != null ? Double.parseDouble(body.get("lat_b").toString()) : null;
        Double lonB = body.get("lon_b") != null ? Double.parseDouble(body.get("lon_b").toString()) : null;

        return ResponseEntity.ok(ApiResponse.success(
                aiService.checkDuplicate(textA, textB, issueA, issueB, locA, locB, latA, lonA, latB, lonB)
        ));
    }

    @PostMapping({"/priority", "/priority-score"})
    public ResponseEntity<?> priorityScore(@RequestBody Map<String, Object> body) {
        Priority severity = body.get("severity") != null ? Priority.valueOf(body.get("severity").toString()) : Priority.MEDIUM;
        Integer population = body.get("affectedPeople") != null ? Integer.parseInt(body.get("affectedPeople").toString()) : 100;
        String category = body.get("category") != null ? body.get("category").toString() : "";
        String desc = body.get("description") != null ? body.get("description").toString() : "";

        return ResponseEntity.ok(ApiResponse.success(
                priorityService.calculatePriority(severity, population, category, desc)
        ));
    }

    @PostMapping("/analyze-complaint")
    public ResponseEntity<?> analyzeComplaint(@RequestBody Map<String, Object> body) {
        String title = body.get("title") != null ? body.get("title").toString() : "";
        String description = body.get("description") != null ? body.get("description").toString() : "";
        String location = body.get("location") != null ? body.get("location").toString() : "";
        Double lat = body.get("latitude") != null ? Double.parseDouble(body.get("latitude").toString()) : null;
        Double lon = body.get("longitude") != null ? Double.parseDouble(body.get("longitude").toString()) : null;

        return ResponseEntity.ok(ApiResponse.success(
                aiService.analyzeComplaint(title, description, location, lat, lon)
        ));
    }

    @GetMapping("/duplicates/{complaintId}")
    public ResponseEntity<?> findDuplicates(@PathVariable Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        return ResponseEntity.ok(ApiResponse.success(
                duplicateService.findPossibleDuplicates(complaint)
        ));
    }

    @GetMapping({"/university-recommendations/{complaintId}", "/university-match/{complaintId}"})
    public ResponseEntity<?> recommendUniversities(@PathVariable Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found"));

        return ResponseEntity.ok(ApiResponse.success(
                universityService.getUniversityMatchDetails(complaint)
        ));
    }

    @GetMapping("/solution-blueprint")
    public ResponseEntity<?> solutionBlueprint(@RequestParam String category) {
        return ResponseEntity.ok(ApiResponse.success(
                solutionService.getSolutionRecommendations(category)
        ));
    }
}
