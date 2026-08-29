package com.sih.sociosphere.auth;

import com.sih.sociosphere.common.enums.UserRole;
import com.sih.sociosphere.security.JwtService;
import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserRepository;
import com.sih.sociosphere.user.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserService userService,
            UserRepository userRepository,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        User user = userService.register(request);

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return toResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.password()
                )
        );

        User user = userService.findByEmail(email);

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return toResponse(user, token);
    }

    public Map<String, Object> getCurrentUser(String email) {
        User user = userService.findByEmail(email);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("userId", user.getId());
        resp.put("name", user.getName());
        resp.put("email", user.getEmail());
        resp.put("role", user.getRole());
        resp.put("createdAt", user.getCreatedAt());
        return resp;
    }

    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userService.findByEmail(email);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password does not match");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public List<Map<String, Object>> getDemoUsers() {
        return List.of(
                Map.of("role", "CITIZEN", "name", "Rahul Sharma (Citizen)", "email", "citizen@sih.gov.in", "password", "Password@123", "description", "Submit societal challenges & evidence"),
                Map.of("role", "ADMIN", "name", "Director R.K. Varma (Govt Admin)", "email", "admin@sih.gov.in", "password", "Password@123", "description", "National Command Center, review & AI assign"),
                
                // 4 Universities
                Map.of("role", "UNIVERSITY", "name", "IIT Bombay (Innovation Cell)", "email", "iitb@sih.gov.in", "password", "Password@123", "description", "IIT Bombay R&D portal"),
                Map.of("role", "UNIVERSITY", "name", "IIT Madras (Research Park)", "email", "iitm@sih.gov.in", "password", "Password@123", "description", "IIT Madras R&D portal"),
                Map.of("role", "UNIVERSITY", "name", "IIT (BHU) Varanasi (Centre of Excellence)", "email", "bhu@sih.gov.in", "password", "Password@123", "description", "IIT (BHU) Varanasi R&D portal"),
                Map.of("role", "UNIVERSITY", "name", "BITS Pilani (Innovation Hub)", "email", "bits@sih.gov.in", "password", "Password@123", "description", "BITS Pilani R&D portal"),
                
                // 4 Faculty Mentors
                Map.of("role", "FACULTY", "name", "Prof. Ananya Sharma (IIT Bombay)", "email", "faculty@iitb.ac.in", "password", "Password@123", "description", "IIT Bombay Mentor - Supervise student teams & approve milestones"),
                Map.of("role", "FACULTY", "name", "Dr. K. Ramesh (IIT Madras)", "email", "faculty@iitm.ac.in", "password", "Password@123", "description", "IIT Madras Mentor - Supervise student teams & approve milestones"),
                Map.of("role", "FACULTY", "name", "Dr. S.K. Mishra (IIT BHU Varanasi)", "email", "faculty@bhu.ac.in", "password", "Password@123", "description", "IIT BHU Mentor - Supervise student teams & approve milestones"),
                Map.of("role", "FACULTY", "name", "Dr. Rajesh Gupta (BITS Pilani)", "email", "faculty@bits.ac.in", "password", "Password@123", "description", "BITS Pilani Mentor - Supervise student teams & approve milestones"),
                
                // 4 Student Leads
                Map.of("role", "STUDENT", "name", "Aarav Patel (IIT Bombay)", "email", "student@iitb.ac.in", "password", "Password@123", "description", "IIT Bombay Student Lead - Sprint tasks, Kanban board, deliverables"),
                Map.of("role", "STUDENT", "name", "Sneha Reddy (IIT Madras)", "email", "student@iitm.ac.in", "password", "Password@123", "description", "IIT Madras Student Lead - Sprint tasks, Kanban board, deliverables"),
                Map.of("role", "STUDENT", "name", "Rohan Verma (IIT BHU Varanasi)", "email", "student@bhu.ac.in", "password", "Password@123", "description", "IIT BHU Student Lead - Sprint tasks, Kanban board, deliverables"),
                Map.of("role", "STUDENT", "name", "Vikram Deshmukh (BITS Pilani)", "email", "student@bits.ac.in", "password", "Password@123", "description", "BITS Pilani Student Lead - Sprint tasks, Kanban board, deliverables"),
                
                // Industry
                Map.of("role", "INDUSTRY", "name", "Tata CSR Innovation Trust", "email", "csr@tata.com", "password", "Password@123", "description", "Browse projects, commit funding & offer mentorship")
        );
    }

    private AuthResponse toResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
