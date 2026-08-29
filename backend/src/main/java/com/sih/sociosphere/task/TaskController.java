package com.sih.sociosphere.task;

import com.sih.sociosphere.common.ApiResponse;
import com.sih.sociosphere.common.enums.Priority;
import com.sih.sociosphere.common.enums.TaskStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(service.getByProject(projectId)));
    }

    @GetMapping({"/my", "/mine", ""})
    public ResponseEntity<?> getMyTasks(@RequestParam(required = false) Long studentId) {
        if (studentId != null) {
            return ResponseEntity.ok(ApiResponse.success(service.getByStudent(studentId)));
        }
        return ResponseEntity.ok(ApiResponse.success(service.getByProject(1L)));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Long projectId = Long.parseLong(body.get("projectId").toString());
        Long milestoneId = body.get("milestoneId") != null ? Long.parseLong(body.get("milestoneId").toString()) : null;
        Long studentId = body.get("assignedToStudentId") != null ? Long.parseLong(body.get("assignedToStudentId").toString()) : null;
        String title = (String) body.get("title");
        String desc = (String) body.get("description");
        Priority priority = body.get("priority") != null ? Priority.valueOf(body.get("priority").toString()) : Priority.MEDIUM;
        LocalDate dueDate = body.get("dueDate") != null ? LocalDate.parse(body.get("dueDate").toString()) : null;

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                service.createTask(projectId, milestoneId, studentId, title, desc, priority, dueDate)
        ));
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TaskStatus status = TaskStatus.valueOf(body.get("status").trim().toUpperCase());
        return ResponseEntity.ok(ApiResponse.success(service.updateStatus(id, status)));
    }
}
