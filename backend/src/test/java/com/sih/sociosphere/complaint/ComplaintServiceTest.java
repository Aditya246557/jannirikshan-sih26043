package com.sih.sociosphere.complaint;

import com.sih.sociosphere.ai.PriorityPredictionService;
import com.sih.sociosphere.audit.AuditService;
import com.sih.sociosphere.common.enums.ComplaintStatus;
import com.sih.sociosphere.common.enums.Priority;
import com.sih.sociosphere.faculty.FacultyRepository;
import com.sih.sociosphere.notification.NotificationService;
import com.sih.sociosphere.university.UniversityRepository;
import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ComplaintServiceTest {

    private ComplaintRepository complaintRepository;
    private UserService userService;
    private UniversityRepository universityRepository;
    private FacultyRepository facultyRepository;
    private PriorityPredictionService priorityPredictionService;
    private com.sih.sociosphere.ai.UniversityRecommendationService universityRecommendationService;
    private AuditService auditService;
    private NotificationService notificationService;
    private ComplaintService service;

    @BeforeEach
    void setUp() {
        complaintRepository = Mockito.mock(ComplaintRepository.class);
        userService = Mockito.mock(UserService.class);
        universityRepository = Mockito.mock(UniversityRepository.class);
        facultyRepository = Mockito.mock(FacultyRepository.class);
        priorityPredictionService = Mockito.mock(PriorityPredictionService.class);
        universityRecommendationService = Mockito.mock(com.sih.sociosphere.ai.UniversityRecommendationService.class);
        auditService = Mockito.mock(AuditService.class);
        notificationService = Mockito.mock(NotificationService.class);

        service = new ComplaintService(
                complaintRepository,
                userService,
                universityRepository,
                facultyRepository,
                priorityPredictionService,
                universityRecommendationService,
                auditService,
                notificationService
        );
    }

    @Test
    @DisplayName("Should create complaint and trigger rule-based priority scoring calculation")
    void testCreateComplaintWithScoring() {
        User citizen = new User();
        citizen.setId(10L);
        citizen.setEmail("citizen@sih.gov.in");
        citizen.setName("Rahul Sharma");

        when(userService.findByEmail("citizen@sih.gov.in")).thenReturn(citizen);

        when(priorityPredictionService.calculatePriority(any(), any(), any(), any()))
                .thenReturn(Map.of(
                        "priorityScore", 78.5,
                        "priorityLevel", "HIGH",
                        "breakdown", Map.of("severity", 80, "population", 75)
                ));

        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> {
            Complaint c = invocation.getArgument(0);
            c.setId(101L);
            return c;
        });

        ComplaintRequest req = new ComplaintRequest(
                "Contaminated Drinking Water",
                "Severe fluoride contamination affecting primary school children",
                "Water Management",
                "Groundwater",
                "Societal Challenge",
                Priority.HIGH,
                1200,
                "Safe community filter kiosk",
                "Deploy arsenic and fluoride adsorption filter",
                "+91 9876543210",
                null,
                25.3176,
                82.9739,
                "Ward 4",
                "Kashi",
                "Varanasi Sadar",
                "Varanasi",
                "Uttar Pradesh",
                null
        );

        ComplaintResponse response = service.create(req, "citizen@sih.gov.in");

        assertNotNull(response);
        assertEquals(101L, response.id());
        assertEquals(ComplaintStatus.SUBMITTED, response.status());
        assertEquals(Priority.HIGH, response.priority());
        assertEquals(78.5, response.priorityScore());
    }
}