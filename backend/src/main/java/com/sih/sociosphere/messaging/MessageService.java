package com.sih.sociosphere.messaging;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageService {
    private final MessageRepository repository;
    public MessageService(MessageRepository repository) { this.repository = repository; }
    public List<Message> getForUser(Long userId) { return repository.findByRecipientIdOrderBySentAtDesc(userId); }
}