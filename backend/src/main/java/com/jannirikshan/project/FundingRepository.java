package com.jannirikshan.project;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FundingRepository extends JpaRepository<Funding, Long> {
    List<Funding> findByProjectId(Long projectId);
}
