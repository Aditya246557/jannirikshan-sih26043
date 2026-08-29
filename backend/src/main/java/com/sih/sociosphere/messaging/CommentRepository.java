package com.sih.sociosphere.messaging;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByComplaintIdOrderByCreatedAtAsc(Long complaintId);
    List<Comment> findByProjectIdOrderByCreatedAtAsc(Long projectId);
}
