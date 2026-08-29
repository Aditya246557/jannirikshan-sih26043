package com.adhikar.backend.controller;

import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.adhikar.backend.service.FastApiAIService;

/**
 * Local readiness endpoint used before a demo to confirm that all required
 * services are available. It deliberately exposes no credentials or data.
 */
@RestController
@RequestMapping("/api/system")
public class SystemHealthController {

    private final DataSource dataSource;
    private final FastApiAIService fastApiAIService;

    public SystemHealthController(
            DataSource dataSource,
            FastApiAIService fastApiAIService
    ) {
        this.dataSource = dataSource;
        this.fastApiAIService = fastApiAIService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("backend", "UP");
        result.put("database", isDatabaseAvailable() ? "UP" : "DOWN");
        result.put("ai", fastApiAIService.getServiceHealth());

        boolean ready = "UP".equals(result.get("database"))
                && "UP".equals(((Map<?, ?>) result.get("ai")).get("status"));
        result.put("ready", ready);

        return ResponseEntity.ok(result);
    }

    private boolean isDatabaseAvailable() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2);
        } catch (Exception exception) {
            return false;
        }
    }
}
