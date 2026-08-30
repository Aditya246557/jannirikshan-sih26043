package com.jannirikshan.task;

import com.jannirikshan.common.enums.Priority;
import com.jannirikshan.common.enums.TaskStatus;
import com.jannirikshan.milestone.Milestone;
import com.jannirikshan.milestone.MilestoneRepository;
import com.jannirikshan.project.Project;
import com.jannirikshan.project.ProjectRepository;
import com.jannirikshan.student.Student;
import com.jannirikshan.student.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final StudentRepository studentRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            MilestoneRepository milestoneRepository,
            StudentRepository studentRepository
    ) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.milestoneRepository = milestoneRepository;
        this.studentRepository = studentRepository;
    }

    public List<Task> getByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getByStudent(Long studentId) {
        return taskRepository.findByAssignedToId(studentId);
    }

    @Transactional
    public Task createTask(Long projectId, Long milestoneId, Long studentId, String title, String description, Priority priority, LocalDate dueDate) {
        Project p = projectRepository.findById(projectId).orElseThrow();
        Milestone m = milestoneId != null ? milestoneRepository.findById(milestoneId).orElse(null) : null;
        Student s = studentId != null ? studentRepository.findById(studentId).orElse(null) : null;

        Task t = new Task();
        t.setProject(p);
        t.setMilestone(m);
        t.setAssignedTo(s);
        t.setTitle(title);
        t.setDescription(description);
        t.setPriority(priority != null ? priority : Priority.MEDIUM);
        t.setStatus(TaskStatus.TODO);
        t.setDueDate(dueDate != null ? dueDate : LocalDate.now().plusDays(14));

        return taskRepository.save(t);
    }

    @Transactional
    public Task updateStatus(Long taskId, TaskStatus status) {
        Task t = taskRepository.findById(taskId).orElseThrow();
        t.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            t.setCompletedAt(LocalDateTime.now());
        }
        return taskRepository.save(t);
    }
}
