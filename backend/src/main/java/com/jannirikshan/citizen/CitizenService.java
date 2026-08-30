package com.jannirikshan.citizen;

import com.jannirikshan.user.User;
import com.jannirikshan.user.UserService;
import org.springframework.stereotype.Service;

@Service
public class CitizenService {
    private final CitizenProfileRepository repository;
    private final UserService userService;

    public CitizenService(CitizenProfileRepository repository, UserService userService) {
        this.repository = repository;
        this.userService = userService;
    }

    public CitizenProfile getMyProfile(String email) {
        User user = userService.findByEmail(email);
        return repository.findByUserId(user.getId()).orElseGet(() -> {
            CitizenProfile cp = new CitizenProfile();
            cp.setUser(user);
            return repository.save(cp);
        });
    }

    public CitizenProfile updateProfile(String email, CitizenProfile profile) {
        CitizenProfile existing = getMyProfile(email);
        existing.setPhone(profile.getPhone());
        existing.setAddress(profile.getAddress());
        existing.setVillageCity(profile.getVillageCity());
        existing.setBlock(profile.getBlock());
        existing.setDistrict(profile.getDistrict());
        existing.setState(profile.getState());
        existing.setBio(profile.getBio());
        return repository.save(existing);
    }
}