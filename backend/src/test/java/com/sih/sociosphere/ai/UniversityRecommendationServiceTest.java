package com.sih.sociosphere.ai;

import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.university.University;
import com.sih.sociosphere.university.UniversityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class UniversityRecommendationServiceTest {

    private UniversityRepository universityRepository;
    private AiClient aiClient;
    private UniversityRecommendationService service;

    @BeforeEach
    void setUp() {
        universityRepository = Mockito.mock(UniversityRepository.class);
        aiClient = Mockito.mock(AiClient.class);
        service = new UniversityRecommendationService(universityRepository, aiClient);
    }

    @Test
    @DisplayName("Should rank university with matching expertise and regional proximity higher")
    void testUniversityRecommendationRanking() {
        Complaint challenge = new Complaint();
        challenge.setCategory("Water Management");
        challenge.setState("Maharashtra");

        University topUniv = new University();
        topUniv.setId(1L);
        topUniv.setName("IIT Bombay");
        topUniv.setState("Maharashtra");
        topUniv.setExpertiseAreas("Water Purification, Environmental Engineering, IoT Desalination");
        topUniv.setDepartmentsList("Civil & Environmental Engineering");
        topUniv.setCapacity(20);
        topUniv.setActiveProjectsCount(2);

        University otherUniv = new University();
        otherUniv.setId(2L);
        otherUniv.setName("Generic Arts College");
        otherUniv.setState("Kerala");
        otherUniv.setExpertiseAreas("Literature, History");
        otherUniv.setDepartmentsList("Humanities");
        otherUniv.setCapacity(5);
        otherUniv.setActiveProjectsCount(5);

        when(universityRepository.findAll()).thenReturn(List.of(otherUniv, topUniv));

        List<Map<String, Object>> recommendations = service.recommendUniversities(challenge);

        assertNotNull(recommendations);
        assertEquals(2, recommendations.size());
        assertEquals("IIT Bombay", recommendations.get(0).get("universityName"), "IIT Bombay should be ranked first");
        Number topScore = (Number) recommendations.get(0).get("matchScore");
        assertTrue(topScore.doubleValue() >= 80.0, "Top university should have match score >= 80% but had: " + topScore);
    }
}