package com.jannirikshan.ai;

import com.jannirikshan.common.enums.Priority;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PriorityPredictionServiceTest {

    private PriorityPredictionService service;
    private AiClient aiClient;

    @BeforeEach
    void setUp() {
        aiClient = Mockito.mock(AiClient.class);
        service = new PriorityPredictionService(aiClient);
    }

    @Test
    @DisplayName("Should score CRITICAL challenge with high population above 70 threshold")
    void testCriticalChallengeScoring() {
        Map<String, Object> result = service.calculatePriority(
                Priority.CRITICAL,
                15000,
                "Water Management",
                "Immediate toxic arsenic contamination danger near school water supply"
        );

        assertNotNull(result);
        Double score = (Double) result.get("priorityScore");
        String level = (String) result.get("priorityLevel");

        assertTrue(score >= 70.0, "Score should be >= 70.0 for critical toxic issue but was: " + score);
        assertTrue(level.equals("CRITICAL") || level.equals("HIGH"));
        assertTrue(result.containsKey("breakdown"));
    }

    @Test
    @DisplayName("Should score LOW severity challenge with small population below 50")
    void testLowChallengeScoring() {
        Map<String, Object> result = service.calculatePriority(
                Priority.LOW,
                10,
                "Other",
                "Minor cosmetic crack on park bench"
        );

        assertNotNull(result);
        Double score = (Double) result.get("priorityScore");
        String level = (String) result.get("priorityLevel");

        assertTrue(score < 50.0, "Score should be < 50.0 for minor cosmetic issue but was: " + score);
        assertTrue(level.equals("LOW") || level.equals("MEDIUM"));
    }

    @Test
    @DisplayName("Should handle null inputs gracefully with sensible defaults")
    void testNullInputsHandling() {
        Map<String, Object> result = service.calculatePriority(
                null,
                null,
                null,
                null
        );

        assertNotNull(result);
        Double score = (Double) result.get("priorityScore");
        assertNotNull(score);
        assertTrue(score >= 0.0 && score <= 100.0);
    }
}