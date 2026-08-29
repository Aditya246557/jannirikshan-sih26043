package com.sih.sociosphere.notification;

import com.sih.sociosphere.common.ApiResponse;
import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationController(NotificationRepository notificationRepository, UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            Authentication authentication
    ) {
        User user = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(
                notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
        ));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        long count = notificationRepository.countByRecipientIdAndReadFalse(user.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    @Transactional
    public ResponseEntity<?> markRead(@PathVariable Long id, Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        Notification n = notificationRepository.findById(id).orElseThrow();
        if (n.getRecipient().getId().equals(user.getId())) {
            n.setRead(true);
            notificationRepository.save(n);
        }
        return ResponseEntity.ok(ApiResponse.success("Marked as read"));
    }

    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<?> markAllRead(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        var notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 100));
        for (Notification n : notifications) {
            n.setRead(true);
        }
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(ApiResponse.success("All marked as read"));
    }
}
