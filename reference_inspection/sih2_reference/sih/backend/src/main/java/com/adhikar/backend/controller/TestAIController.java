package com.adhikar.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.adhikar.backend.service.FastApiAIService;
import com.fasterxml.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/test-ai")
public class TestAIController {

    private final FastApiAIService fastApiAIService;

    public TestAIController(FastApiAIService fastApiAIService) {
        this.fastApiAIService = fastApiAIService;
    }

    @PostMapping("/predict")
    public ResponseEntity<String> predict(
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        JsonNode result = fastApiAIService.predict(file);

        return ResponseEntity.ok(
                result.toString()
        );
    }
}