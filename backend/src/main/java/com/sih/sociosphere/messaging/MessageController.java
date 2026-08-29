package com.sih.sociosphere.messaging;

import com.sih.sociosphere.common.ApiResponse;
import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messages")
public class MessageController {
    private final MessageService service;
    private final UserService userService;

    public MessageController(MessageService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getMyMessages(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(service.getForUser(user.getId())));
    }
}