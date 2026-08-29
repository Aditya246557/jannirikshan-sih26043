package com.sih.sociosphere.faculty;

import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FacultyService {
    private final FacultyRepository facultyRepository;
    private final UserService userService;

    public FacultyService(FacultyRepository facultyRepository, UserService userService) {
        this.facultyRepository = facultyRepository;
        this.userService = userService;
    }

    public Faculty getMyProfile(String email) {
        User user = userService.findByEmail(email);
        if (user == null) return null;
        return facultyRepository.findByUserId(user.getId()).orElse(null);
    }
}