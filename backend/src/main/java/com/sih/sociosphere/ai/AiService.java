package com.sih.sociosphere.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.sociosphere.common.enums.Priority;
import com.sih.sociosphere.complaint.Complaint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final ChallengeClassificationService classificationService;
    private final PriorityPredictionService priorityService;
    private final DuplicateDetectionService duplicateService;
    private final AiClient aiClient;
    private final ObjectMapper objectMapper;

    public AiService(
            ChallengeClassificationService classificationService,
            PriorityPredictionService priorityService,
            DuplicateDetectionService duplicateService,
            AiClient aiClient
    ) {
        this.classificationService = classificationService;
        this.priorityService = priorityService;
        this.duplicateService = duplicateService;
        this.aiClient = aiClient;
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> analyzeChallenge(String title, String description) {
        Map<String, Object> cat = classificationService.predictCategory(title, description);
        return Map.of("categoryAnalysis", cat);
    }

    public JsonNode validateImage(MultipartFile file) {
        try {
            return aiClient.predictImage(file);
        } catch (Exception e) {
            log.warn("Direct AI validation error: {}", e.getMessage());
            return objectMapper.createObjectNode()
                    .put("success", false)
                    .put("valid", false)
                    .put("stage", "SERVICE_UNAVAILABLE")
                    .put("error_type", "AI_VALIDATION_UNAVAILABLE")
                    .put("status", "AI_VALIDATION_UNAVAILABLE")
                    .put("message", "AI validation is temporarily unavailable. Please try again.");
        }
    }

    public JsonNode generateComplaintDetails(MultipartFile file, String location, String description, Integer variation) {
        try {
            return aiClient.generateComplaintDetails(file, location, description, variation);
        } catch (Exception e) {
            log.warn("AI detail generation warning: {}", e.getMessage());
            return objectMapper.createObjectNode()
                    .put("success", false)
                    .put("valid", false)
                    .put("stage", "SERVICE_UNAVAILABLE")
                    .put("error_type", "AI_VALIDATION_UNAVAILABLE")
                    .put("status", "AI_VALIDATION_UNAVAILABLE")
                    .put("message", "AI detail generation is temporarily unavailable. Please enter the complaint details manually.")
                    .set("details", null);
        }
    }

    public JsonNode processComplaintEvidence(Complaint complaint, MultipartFile file) {
        if (complaint == null || file == null || file.isEmpty()) return null;

        try {
            JsonNode result = aiClient.predictImage(file);
            if (result != null && result.has("valid") && result.path("valid").asBoolean(true)) {
                String detectedClass = result.has("detected_class") && !result.path("detected_class").isNull()
                        ? result.path("detected_class").asText() : null;
                String detectedCat = result.has("detected_category") && !result.path("detected_category").isNull()
                        ? result.path("detected_category").asText() : null;
                String recommendedDept = result.has("recommended_department") && !result.path("recommended_department").isNull()
                        ? result.path("recommended_department").asText() : null;
                Double confidence = result.has("detected_confidence") && !result.path("detected_confidence").isNull()
                        ? result.path("detected_confidence").asDouble() : null;
                String severityStr = result.has("detected_severity") && !result.path("detected_severity").isNull()
                        ? result.path("detected_severity").asText() : "MEDIUM";

                boolean isSupportedDefect = detectedClass != null && !detectedClass.isBlank() &&
                        (detectedClass.equalsIgnoreCase("pothole") ||
                         detectedClass.equalsIgnoreCase("garbage") ||
                         detectedClass.equalsIgnoreCase("broken_street_light") ||
                         detectedClass.equalsIgnoreCase("fallen_tree"));

                Double existingConf = complaint.getAiConfidence();
                boolean shouldUpdate = false;

                if (isSupportedDefect) {
                    if (complaint.getAiDetectedClass() == null || "NO_SUPPORTED_DEFECT".equalsIgnoreCase(complaint.getAiDetectedClass()) || existingConf == null || (confidence != null && confidence > existingConf)) {
                        shouldUpdate = true;
                    }
                } else if (complaint.getAiDetectedClass() == null) {
                    complaint.setAiDetectedClass("NO_SUPPORTED_DEFECT");
                    if (complaint.getCategory() == null || complaint.getCategory().startsWith("Pending")) {
                        complaint.setCategory(complaint.getCitizenSuggestedCategory() != null ? complaint.getCitizenSuggestedCategory() : "Civic Issue (General)");
                    }
                    complaint.setAiCategory(complaint.getCategory());
                    complaint.setAiDomain("Civic Complaints");
                    complaint.setAiDomainConfidence(0.5);
                    complaint.setAiRecommendedDepartment("General Municipal Administration");
                    complaint.setAiConfidence(null);
                    complaint.setAiPriority(Priority.MEDIUM);
                    complaint.setAiModelVersion("socio-sphere-unified-ai-v3");
                    complaint.setAiProcessedAt(LocalDateTime.now());
                }

                if (shouldUpdate) {
                    complaint.setAiDetectedClass(detectedClass.toLowerCase());
                    complaint.setCategory(detectedCat);
                    complaint.setAiCategory(detectedCat);
                    complaint.setAiDomain("Civic Complaints");
                    complaint.setAiDomainConfidence(confidence != null ? confidence / 100.0 : 0.85);

                    String cleanCivicIssue = detectedClass.replace("_", " ").substring(0, 1).toUpperCase() + detectedClass.replace("_", " ").substring(1);
                    complaint.setAiCivicIssue(cleanCivicIssue);
                    complaint.setAiCivicIssueConfidence(confidence != null ? confidence / 100.0 : 0.85);

                    if (result.has("detections")) {
                        complaint.setAiBoundingBoxes(result.path("detections").toString());
                    }

                    complaint.setAiRecommendedDepartment(recommendedDept);
                    complaint.setAiConfidence(confidence != null ? Math.round(confidence * 100.0) / 100.0 : null);

                    try {
                        Priority prio = Priority.valueOf(severityStr.toUpperCase());
                        complaint.setAiPriority(prio);
                        if (!complaint.isPriorityManuallyOverridden()) {
                            complaint.setSeverity(prio);
                            Map<String, Object> prioResult = priorityService.calculatePriority(
                                    prio,
                                    complaint.getAffectedPeople(),
                                    complaint.getCategory(),
                                    complaint.getDescription()
                            );
                            if (prioResult.get("priorityScore") != null) {
                                complaint.setPriorityScore((Double) prioResult.get("priorityScore"));
                            }
                            if (prioResult.get("priorityLevel") != null) {
                                complaint.setPriority(Priority.valueOf(prioResult.get("priorityLevel").toString()));
                            }
                            if (prioResult.get("breakdown") != null) {
                                complaint.setPriorityBreakdownJson(prioResult.get("breakdown").toString());
                            }
                        }
                    } catch (Exception ignored) {
                        complaint.setAiPriority(Priority.MEDIUM);
                    }

                    // Conflict / Mismatch Detection
                    String descLower = (complaint.getDescription() + " " + complaint.getTitle() + " " + (complaint.getCitizenSuggestedCategory() != null ? complaint.getCitizenSuggestedCategory() : "")).toLowerCase();
                    boolean mismatch = false;
                    String mismatchMsg = null;

                    if (detectedClass.equalsIgnoreCase("fallen_tree")) {
                        if (descLower.contains("pothole") || descLower.contains("pit hole") || descLower.contains("crater") || descLower.contains("road damage") || descLower.contains("clean energy") || descLower.contains("solar") || descLower.contains("sanitation")) {
                            mismatch = true;
                            mismatchMsg = "⚠️ AI / Evidence Conflict: Citizen description/category references other issues, but computer vision analysis detected a fallen tree.";
                        }
                    } else if (detectedClass.equalsIgnoreCase("pothole")) {
                        if (descLower.contains("garbage") || descLower.contains("trash") || descLower.contains("waste") || descLower.contains("streetlight")) {
                            mismatch = true;
                            mismatchMsg = "⚠️ AI / Evidence Conflict: Citizen description references non-road issues, but computer vision analysis detected road pothole defect.";
                        }
                    } else if (detectedClass.equalsIgnoreCase("garbage")) {
                        if (descLower.contains("street light") || descLower.contains("streetlight") || descLower.contains("dark pole") || descLower.contains("tree")) {
                            mismatch = true;
                            mismatchMsg = "⚠️ AI / Evidence Conflict: Citizen description references lighting/trees, but computer vision analysis detected uncollected solid waste.";
                        }
                    } else if (detectedClass.equalsIgnoreCase("broken_street_light")) {
                        if (descLower.contains("garbage") || descLower.contains("trash") || descLower.contains("pothole")) {
                            mismatch = true;
                            mismatchMsg = "⚠️ AI / Evidence Conflict: Citizen description references sanitation/roads, but computer vision analysis detected broken streetlight.";
                        }
                    }

                    complaint.setAiMismatch(mismatch);
                    complaint.setAiMismatchWarning(mismatchMsg);
                    complaint.setAiModelVersion("socio-sphere-unified-ai-v3");
                    complaint.setAiProcessedAt(LocalDateTime.now());

                    log.info("AI Analysis completed for Complaint #{}: class={}, category={}, confidence={}%",
                            complaint.getId(), complaint.getAiDetectedClass(), complaint.getCategory(), complaint.getAiConfidence());
                }
            } else if (result != null && !result.path("valid").asBoolean(true)) {
                if (complaint.getAiDetectedClass() == null) {
                    complaint.setAiDetectedClass("NO_SUPPORTED_DEFECT");
                    complaint.setAiConfidence(null);
                    complaint.setAiModelVersion("socio-sphere-unified-ai-v3");
                    complaint.setAiProcessedAt(LocalDateTime.now());
                }
            }
            return result;
        } catch (Exception e) {
            log.warn("AI processing warning for Complaint #{}: {}", complaint.getId(), e.getMessage());
            if (complaint.getAiCategory() == null) {
                complaint.setAiCategory(complaint.getCategory());
            }
            complaint.setAiModelVersion("socio-sphere-unified-ai-v3");
            complaint.setAiProcessedAt(LocalDateTime.now());
            return null;
        }
    }

    public JsonNode classifyCivicIssue(String text) {
        return aiClient.classifyCivicIssue(text);
    }

    public JsonNode checkDuplicate(String textA, String textB, String issueA, String issueB, String locA, String locB, Double latA, Double lonA, Double latB, Double lonB) {
        return aiClient.checkDuplicate(textA, textB, issueA, issueB, locA, locB, latA, lonA, latB, lonB);
    }

    public JsonNode predictPriority(String issueType, Integer clusterSize, Integer severity, Integer safetyRisk, Double durationHours) {
        return aiClient.predictPriority(issueType, clusterSize, severity, safetyRisk, durationHours);
    }

    public JsonNode analyzeComplaint(String title, String description, String location, Double lat, Double lon) {
        return aiClient.analyzeComplaint(title, description, location, lat, lon);
    }

    public Map<String, Object> getAiHealth() {
        return aiClient.getServiceHealth();
    }
}