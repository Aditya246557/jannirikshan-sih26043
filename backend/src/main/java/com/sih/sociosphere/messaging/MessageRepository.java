package com.sih.sociosphere.messaging;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRecipientIdOrderBySentAtDesc(Long recipientId);
}