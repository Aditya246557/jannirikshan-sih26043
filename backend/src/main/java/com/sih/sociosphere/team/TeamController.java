package com.sih.sociosphere.team;

import com.sih.sociosphere.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/teams")
public class TeamController {

    private final TeamService service;

    public TeamController(TeamService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createTeam(@RequestBody Map<String, Object> body) {
        Long projectId = Long.parseLong(body.get("projectId").toString());
        String teamName = body.get("teamName") != null ? body.get("teamName").toString() : null;
        Long leaderId = body.get("leaderStudentId") != null ? Long.parseLong(body.get("leaderStudentId").toString()) : (body.get("leaderId") != null ? Long.parseLong(body.get("leaderId").toString()) : null);
        return ResponseEntity.ok(ApiResponse.success(service.createTeam(projectId, teamName, leaderId)));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectTeams(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(service.getTeamsForProject(projectId)));
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<?> getMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(ApiResponse.success(service.getMembers(teamId)));
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<?> addMember(
            @PathVariable Long teamId,
            @RequestBody Map<String, Object> body
    ) {
        Long studentId = Long.parseLong(body.get("studentId").toString());
        String role = (String) body.get("roleInTeam");
        return ResponseEntity.ok(ApiResponse.success(service.addMember(teamId, studentId, role)));
    }
}
