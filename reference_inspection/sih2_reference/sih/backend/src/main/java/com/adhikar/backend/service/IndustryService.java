package com.adhikar.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.adhikar.backend.dto.SponsorProjectRequest;
import com.adhikar.backend.entity.IndustrySponsorship;
import com.adhikar.backend.entity.UniversityProject;
import com.adhikar.backend.repository.IndustrySponsorshipRepository;
import com.adhikar.backend.repository.UniversityProjectRepository;

@Service
public class IndustryService {

    private final IndustrySponsorshipRepository industrySponsorshipRepository;
    private final UniversityProjectRepository universityProjectRepository;

    public IndustryService(
            IndustrySponsorshipRepository industrySponsorshipRepository,
            UniversityProjectRepository universityProjectRepository
    ) {
        this.industrySponsorshipRepository = industrySponsorshipRepository;
        this.universityProjectRepository = universityProjectRepository;
    }

    // =====================================================
    // SPONSOR PROJECT / GRANT CSR FUNDING
    // =====================================================

    public IndustrySponsorship sponsorProject(SponsorProjectRequest request, String sponsorEmail) {

        UniversityProject project = universityProjectRepository.findById(request.projectId())
                .orElseThrow(() -> new RuntimeException("University project not found"));

        double grant = request.grantAmount() != null ? request.grantAmount() : 0.0;

        IndustrySponsorship sponsorship = new IndustrySponsorship(
                request.projectId(),
                request.challengeId(),
                request.companyName(),
                sponsorEmail,
                request.supportType(),
                grant,
                request.notes()
        );

        sponsorship = industrySponsorshipRepository.save(sponsorship);

        // Update project total funding
        double currentFunding = project.getTotalFunding() != null ? project.getTotalFunding() : 0.0;
        project.setTotalFunding(currentFunding + grant);
        universityProjectRepository.save(project);

        return sponsorship;
    }

    public List<IndustrySponsorship> getSponsorshipsBySponsor(String sponsorEmail) {
        return industrySponsorshipRepository.findBySponsorEmail(sponsorEmail);
    }

    public List<IndustrySponsorship> getAllSponsorships() {
        return industrySponsorshipRepository.findAll();
    }
}
