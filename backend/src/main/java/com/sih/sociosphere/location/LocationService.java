package com.sih.sociosphere.location;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LocationService {
    public List<String> getDistricts() {
        return List.of("Varanasi", "Pune", "Amritsar", "Chennai", "Mumbai", "Ranchi", "Jaipur", "Guwahati", "Bangalore", "Patna", "Coimbatore");
    }
}