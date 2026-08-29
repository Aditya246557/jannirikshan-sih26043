package com.sih.sociosphere.ai;

import com.sih.sociosphere.common.enums.ComplaintStatus;
import com.sih.sociosphere.common.enums.Priority;
import com.sih.sociosphere.complaint.ChallengeDuplicateRelationRepository;
import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.complaint.ComplaintRepository;
import com.sih.sociosphere.evidence.EvidenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class DuplicateDetectionServiceTest {

    private ComplaintRepository complaintRepository;
    private EvidenceRepository evidenceRepository;
    private ChallengeDuplicateRelationRepository relationRepository;
    private AiClient aiClient;
    private DuplicateDetectionService service;

    @BeforeEach
    void setUp() {
        complaintRepository = Mockito.mock(ComplaintRepository.class);
        evidenceRepository = Mockito.mock(EvidenceRepository.class);
        relationRepository = Mockito.mock(ChallengeDuplicateRelationRepository.class);
        aiClient = Mockito.mock(AiClient.class);
        service = new DuplicateDetectionService(complaintRepository, evidenceRepository, relationRepository, aiClient);
    }

    @Test
    @DisplayName("Should detect duplicate candidate when in same district, same category, and close GPS distance")
    void testDetectCloseDuplicate() {
        Complaint target = new Complaint();
        target.setId(1L);
        target.setTitle("Severe Handpump Water Contamination in Varanasi");
        target.setDescription("Water is yellow and smells like sulfur in village ward 4");
        target.setCategory("Water");
        target.setDistrict("Varanasi");
        target.setLatitude(25.3176);
        target.setLongitude(82.9739);
        target.setStatus(ComplaintStatus.SUBMITTED);
        target.setPriority(Priority.HIGH);

        Complaint existing = new Complaint();
        existing.setId(2L);
        existing.setTitle("Contaminated Drinking Water from Handpumps");
        existing.setDescription("Sulfur smell and high turbidity in water supply");
        existing.setCategory("Water");
        existing.setDistrict("Varanasi");
        existing.setLatitude(25.3190); // ~200 meters away
        existing.setLongitude(82.9750);
        existing.setStatus(ComplaintStatus.APPROVED);
        existing.setPriority(Priority.HIGH);

        when(complaintRepository.findAll()).thenReturn(List.of(target, existing));

        List<Map<String, Object>> duplicates = service.findPossibleDuplicates(target);

        assertNotNull(duplicates);
        assertFalse(duplicates.isEmpty(), "Should detect at least 1 duplicate candidate");
        assertEquals(2L, duplicates.get(0).get("challengeId"));
        Double similarity = (Double) duplicates.get(0).get("similarityScore");
        assertTrue(similarity >= 60.0, "Similarity should be high (>= 60%) but was: " + similarity);
    }
}