package com.adhikar.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
@Service
public class FastApiAIService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public FastApiAIService(
            @Value("${ai.service.connect-timeout:3s}") Duration connectTimeout,
            @Value("${ai.service.read-timeout:20s}") Duration readTimeout
    ) {
        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(connectTimeout);
        requestFactory.setReadTimeout(readTimeout);

        this.restTemplate = new RestTemplate(requestFactory);
        this.objectMapper = new ObjectMapper();
    }

    public JsonNode predict(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required.");
        }

        byte[] fileBytes = file.getBytes();

        ByteArrayResource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };

        HttpHeaders fileHeaders = new HttpHeaders();

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        if (file.getContentType() != null) {
            try {
                mediaType = MediaType.parseMediaType(file.getContentType());
            } catch (Exception ignored) {
                // Keep application/octet-stream
            }
        }

        fileHeaders.setContentType(mediaType);

        HttpEntity<ByteArrayResource> fileEntity =
                new HttpEntity<>(resource, fileHeaders);

        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();

        body.add("file", fileEntity);

        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.setContentType(
                MediaType.MULTIPART_FORM_DATA
        );

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, requestHeaders);

        try {

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            aiServiceUrl + "/predict",
                            HttpMethod.POST,
                            requestEntity,
                            String.class
                    );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException(
                        "AI service returned status: "
                                + response.getStatusCode()
                );
            }

            return objectMapper.readTree(
                    response.getBody()
            );

        } catch (RestClientException e) {

            throw new RuntimeException(
                    "Unable to connect to AI service at "
                            + aiServiceUrl,
                    e
            );
        }
    }

    public Map<String, Object> getServiceHealth() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    aiServiceUrl + "/health",
                    String.class
            );

            return Map.of(
                    "status", response.getStatusCode().is2xxSuccessful() ? "UP" : "DOWN",
                    "details", response.getBody() == null ? "AI service responded." : response.getBody()
            );
        } catch (RestClientException exception) {
            return Map.of(
                    "status", "DOWN",
                    "details", "AI service is unavailable. Start the FastAPI service on port 8000."
            );
        }
    }
}
