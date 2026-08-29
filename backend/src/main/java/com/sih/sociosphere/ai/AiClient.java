package com.sih.sociosphere.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Component
public class AiClient {

    private static final Logger log = LoggerFactory.getLogger(AiClient.class);

    @Value("${ai.service.url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    @Value("${ai.service.enabled:true}")
    private boolean enabled;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiClient(
            @Value("${ai.service.connect-timeout:5s}") Duration connectTimeout,
            @Value("${ai.service.read-timeout:30s}") Duration readTimeout
    ) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    public boolean isAiServiceAvailable() {
        if (!enabled) return false;
        try {
            ResponseEntity<String> res = restTemplate.getForEntity(aiServiceUrl + "/health", String.class);
            return res.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("AI Service unavailable at {}: {}", aiServiceUrl, e.getMessage());
            return false;
        }
    }

    public JsonNode predictImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required for AI inference.");
        }

        byte[] fileBytes = file.getBytes();
        ByteArrayResource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "evidence.jpg";
            }
        };

        HttpHeaders fileHeaders = new HttpHeaders();
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (file.getContentType() != null) {
            try {
                mediaType = MediaType.parseMediaType(file.getContentType());
            } catch (Exception ignored) {}
        }
        fileHeaders.setContentType(mediaType);

        HttpEntity<ByteArrayResource> fileEntity = new HttpEntity<>(resource, fileHeaders);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileEntity);

        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, requestHeaders);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/predict",
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("AI service returned status: " + response.getStatusCode());
            }

            return objectMapper.readTree(response.getBody());
        } catch (RestClientException e) {
            log.error("Failed to execute AI inference at {}: {}", aiServiceUrl, e.getMessage());
            throw new RuntimeException("Unable to connect to AI service at " + aiServiceUrl + ": " + e.getMessage(), e);
        }
    }

    public JsonNode predictImage(byte[] imageBytes, String filename, String contentType) throws IOException {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new IllegalArgumentException("Image bytes cannot be empty.");
        }

        ByteArrayResource resource = new ByteArrayResource(imageBytes) {
            @Override
            public String getFilename() {
                return filename != null ? filename : "evidence.jpg";
            }
        };

        HttpHeaders fileHeaders = new HttpHeaders();
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (contentType != null) {
            try {
                mediaType = MediaType.parseMediaType(contentType);
            } catch (Exception ignored) {}
        }
        fileHeaders.setContentType(mediaType);

        HttpEntity<ByteArrayResource> fileEntity = new HttpEntity<>(resource, fileHeaders);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileEntity);

        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, requestHeaders);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/predict",
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("AI service returned status: " + response.getStatusCode());
            }

            return objectMapper.readTree(response.getBody());
        } catch (RestClientException e) {
            log.error("Failed to execute AI inference at {}: {}", aiServiceUrl, e.getMessage());
            throw new RuntimeException("Unable to connect to AI service at " + aiServiceUrl + ": " + e.getMessage(), e);
        }
    }

    public JsonNode generateComplaintDetails(MultipartFile file, String location, String description, Integer variation) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required for AI detail generation.");
        }

        byte[] fileBytes = file.getBytes();
        ByteArrayResource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "evidence.jpg";
            }
        };

        HttpHeaders fileHeaders = new HttpHeaders();
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (file.getContentType() != null) {
            try {
                mediaType = MediaType.parseMediaType(file.getContentType());
            } catch (Exception ignored) {}
        }
        fileHeaders.setContentType(mediaType);

        HttpEntity<ByteArrayResource> fileEntity = new HttpEntity<>(resource, fileHeaders);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", fileEntity);
        if (location != null && !location.isBlank()) {
            body.add("location", location);
        }
        if (description != null && !description.isBlank()) {
            body.add("description", description);
        }
        if (variation != null) {
            body.add("variation", variation.toString());
        }

        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, requestHeaders);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    aiServiceUrl + "/generate-complaint-details",
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("AI service returned status: " + response.getStatusCode());
            }

            return objectMapper.readTree(response.getBody());
        } catch (RestClientException e) {
            log.error("Failed to generate AI complaint details at {}: {}", aiServiceUrl, e.getMessage());
            throw new RuntimeException("Unable to connect to AI service at " + aiServiceUrl + ": " + e.getMessage(), e);
        }
    }

    public JsonNode classifyDomain(String text, String title, String description) {
        if (!isAiServiceAvailable()) return null;
        try {
            Map<String, Object> body = new HashMap<>();
            if (text != null && !text.isBlank()) body.put("text", text);
            if (title != null && !title.isBlank()) body.put("title", title);
            if (description != null && !description.isBlank()) body.put("description", description);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(aiServiceUrl + "/classify", entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readTree(response.getBody()).path("data");
            }
        } catch (Exception e) {
            log.warn("AI domain classification call failed: {}", e.getMessage());
        }
        return null;
    }

    public JsonNode classifyCivicIssue(String text) {
        if (!isAiServiceAvailable() || text == null || text.isBlank()) return null;
        try {
            Map<String, String> body = Map.of("text", text);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(aiServiceUrl + "/civic-issue", entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readTree(response.getBody()).path("data");
            }
        } catch (Exception e) {
            log.warn("AI civic issue classification call failed: {}", e.getMessage());
        }
        return null;
    }

    public JsonNode checkDuplicate(String textA, String textB, String issueA, String issueB, String locA, String locB, Double latA, Double lonA, Double latB, Double lonB) {
        if (!isAiServiceAvailable()) return null;
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("text_a", textA != null ? textA : "");
            body.put("text_b", textB != null ? textB : "");
            body.put("issue_a", issueA != null ? issueA : "");
            body.put("issue_b", issueB != null ? issueB : "");
            body.put("location_a", locA != null ? locA : "");
            body.put("location_b", locB != null ? locB : "");
            if (latA != null) body.put("lat_a", latA);
            if (lonA != null) body.put("lon_a", lonA);
            if (latB != null) body.put("lat_b", latB);
            if (lonB != null) body.put("lon_b", lonB);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(aiServiceUrl + "/duplicate", entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readTree(response.getBody()).path("data");
            }
        } catch (Exception e) {
            log.warn("AI duplicate check call failed: {}", e.getMessage());
        }
        return null;
    }

    public JsonNode predictPriority(String issueType, Integer clusterSize, Integer severity, Integer safetyRisk, Double durationHours) {
        if (!isAiServiceAvailable()) return null;
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("issue_type", issueType != null ? issueType : "Pothole");
            body.put("cluster_size", clusterSize != null ? clusterSize : 1);
            if (severity != null) body.put("severity", severity);
            if (safetyRisk != null) body.put("safety_risk", safetyRisk);
            if (durationHours != null) body.put("duration_hours", durationHours);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(aiServiceUrl + "/priority", entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readTree(response.getBody()).path("data");
            }
        } catch (Exception e) {
            log.warn("AI priority prediction call failed: {}", e.getMessage());
        }
        return null;
    }

    public JsonNode analyzeComplaint(String title, String description, String location, Double lat, Double lon) {
        if (!isAiServiceAvailable()) return null;
        try {
            Map<String, Object> body = new HashMap<>();
            if (title != null) body.put("title", title);
            if (description != null) body.put("description", description);
            if (location != null) body.put("location", location);
            if (lat != null) body.put("latitude", lat);
            if (lon != null) body.put("longitude", lon);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(aiServiceUrl + "/analyze-complaint", entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            }
        } catch (Exception e) {
            log.warn("AI analyze-complaint call failed: {}", e.getMessage());
        }
        return null;
    }

    public JsonNode matchUniversity(String title, String description, String category, String civicIssue, String priority, String state, String district) {
        if (!isAiServiceAvailable()) return null;
        try {
            Map<String, Object> body = new HashMap<>();
            if (title != null) body.put("title", title);
            if (description != null) body.put("description", description);
            if (category != null) body.put("category", category);
            if (civicIssue != null) body.put("civic_issue", civicIssue);
            if (priority != null) body.put("priority", priority);
            if (state != null) body.put("state", state);
            if (district != null) body.put("district", district);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(aiServiceUrl + "/university-match", entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readTree(response.getBody()).path("data");
            }
        } catch (Exception e) {
            log.warn("AI university matching call failed: {}", e.getMessage());
        }
        return null;
    }

    public Map<String, Object> getServiceHealth() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(aiServiceUrl + "/health", String.class);
            Map<String, Object> result = new HashMap<>();
            result.put("status", response.getStatusCode().is2xxSuccessful() ? "UP" : "DOWN");
            result.put("url", aiServiceUrl);
            if (response.getBody() != null) {
                result.put("details", objectMapper.readTree(response.getBody()));
            }
            return result;
        } catch (Exception e) {
            return Map.of(
                    "status", "DOWN",
                    "url", aiServiceUrl,
                    "error", e.getMessage()
            );
        }
    }
}