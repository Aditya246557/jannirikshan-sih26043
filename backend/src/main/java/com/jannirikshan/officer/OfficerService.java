package com.jannirikshan.officer;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OfficerService {
    private final OfficerRepository repository;
    public OfficerService(OfficerRepository repository) { this.repository = repository; }
    public List<Officer> getAll() { return repository.findAll(); }
}