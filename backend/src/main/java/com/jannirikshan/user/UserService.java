package com.jannirikshan.user;

import com.jannirikshan.auth.RegisterRequest;
import com.jannirikshan.common.enums.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        User user = new User();

        user.setName(request.name().trim());
        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(request.password())
        );

        /*
         * For security, public registration should not be
         * allowed to create ADMIN or GOVERNMENT accounts.
         *
         * Those accounts will later be created/approved
         * through the administrative workflow.
         */
        UserRole requestedRole = request.role();

        if (requestedRole == UserRole.ADMIN
                || requestedRole == UserRole.GOVERNMENT
                || requestedRole == UserRole.OFFICER) {

            throw new IllegalArgumentException(
                    "This role cannot be created through public registration."
            );
        }

        user.setRole(requestedRole);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        return userRepository.findByEmail(
                        email.trim().toLowerCase()
                )
                .orElse(null);
    }
}