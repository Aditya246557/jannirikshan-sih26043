package com.sih.sociosphere.impact;

import com.sih.sociosphere.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/impact")
public class ImpactController {

    private final ImpactService service;

    public ImpactController(ImpactService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(service.getOverallImpactSummary()));
    }

    @GetMapping("/challenge/{id}")
    public ResponseEntity<?> getForChallenge(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getForChallenge(id)));
    }

    @PostMapping
    public ResponseEntity<?> recordImpact(@RequestBody Map<String, Object> body) {
        Long challengeId = body.get("complaintId") != null ? Long.parseLong(body.get("complaintId").toString()) : (body.get("challengeId") != null ? Long.parseLong(body.get("challengeId").toString()) : null);
        Long projectId = body.get("projectId") != null ? Long.parseLong(body.get("projectId").toString()) : null;
        Integer people = body.get("peopleBenefited") != null ? Integer.parseInt(body.get("peopleBenefited").toString()) : (body.get("affectedPeople") != null ? Integer.parseInt(body.get("affectedPeople").toString()) : 500);
        Integer villages = body.get("villagesCovered") != null ? Integer.parseInt(body.get("villagesCovered").toString()) : 1;
        Double costSaved = body.get("costSavedInr") != null ? Double.parseDouble(body.get("costSavedInr").toString()) : 50000.0;
        Double timeSaved = body.get("timeSavedHours") != null ? Double.parseDouble(body.get("timeSavedHours").toString()) : 120.0;
        Double socialScore = body.get("socialImpactScore") != null ? Double.parseDouble(body.get("socialImpactScore").toString()) : 85.0;
        String outcome = (String) body.get("outcomeSummary");

        return ResponseEntity.ok(ApiResponse.success(
                service.recordImpact(challengeId, projectId, people, villages, costSaved, timeSaved, socialScore, outcome)
        ));
    }
}
