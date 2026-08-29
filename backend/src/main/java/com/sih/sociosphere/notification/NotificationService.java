package com.sih.sociosphere.notification;

import com.sih.sociosphere.common.enums.NotificationType;
import com.sih.sociosphere.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void sendNotification(User recipient, String title, String message, NotificationType type, String linkUrl) {
        if (recipient == null) return;
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type != null ? type : NotificationType.GENERAL_ALERT);
        n.setLinkUrl(linkUrl);
        notificationRepository.save(n);
    }
}
