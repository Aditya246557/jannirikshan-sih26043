package com.jannirikshan.task;

import com.jannirikshan.common.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(Long studentId);
    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);
}
