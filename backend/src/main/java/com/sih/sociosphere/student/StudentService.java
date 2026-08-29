package com.sih.sociosphere.student;

import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final UserService userService;

    public StudentService(StudentRepository studentRepository, UserService userService) {
        this.studentRepository = studentRepository;
        this.userService = userService;
    }

    public Student getMyProfile(String email) {
        User user = userService.findByEmail(email);
        if (user == null) return null;
        return studentRepository.findByUserId(user.getId()).orElse(null);
    }

    public Student updateProfile(String email, Student updatedData) {
        Student existing = getMyProfile(email);
        if (existing == null) return null;
        if (updatedData.getSkills() != null) existing.setSkills(updatedData.getSkills());
        if (updatedData.getGithubUrl() != null) existing.setGithubUrl(updatedData.getGithubUrl());
        if (updatedData.getLinkedinUrl() != null) existing.setLinkedinUrl(updatedData.getLinkedinUrl());
        if (updatedData.getPortfolioUrl() != null) existing.setPortfolioUrl(updatedData.getPortfolioUrl());
        if (updatedData.getPhone() != null) existing.setPhone(updatedData.getPhone());
        return studentRepository.save(existing);
    }

    public Student getById(Long id) {
        return studentRepository.findById(id).orElse(null);
    }
}