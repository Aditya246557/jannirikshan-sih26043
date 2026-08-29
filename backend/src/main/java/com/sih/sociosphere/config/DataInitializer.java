package com.sih.sociosphere.config;

import com.sih.sociosphere.citizen.CitizenProfile;
import com.sih.sociosphere.citizen.CitizenProfileRepository;
import com.sih.sociosphere.common.enums.*;
import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.complaint.ComplaintRepository;
import com.sih.sociosphere.department.Department;
import com.sih.sociosphere.department.DepartmentRepository;
import com.sih.sociosphere.evidence.Evidence;
import com.sih.sociosphere.evidence.EvidenceRepository;
import com.sih.sociosphere.faculty.Faculty;
import com.sih.sociosphere.faculty.FacultyRepository;
import com.sih.sociosphere.impact.ImpactMetric;
import com.sih.sociosphere.impact.ImpactRepository;
import com.sih.sociosphere.industry.Industry;
import com.sih.sociosphere.industry.IndustryPartnership;
import com.sih.sociosphere.industry.IndustryPartnershipRepository;
import com.sih.sociosphere.industry.IndustryRepository;
import com.sih.sociosphere.milestone.Milestone;
import com.sih.sociosphere.milestone.MilestoneRepository;
import com.sih.sociosphere.notification.Notification;
import com.sih.sociosphere.notification.NotificationRepository;
import com.sih.sociosphere.project.Funding;
import com.sih.sociosphere.project.FundingRepository;
import com.sih.sociosphere.project.Project;
import com.sih.sociosphere.project.ProjectRepository;
import com.sih.sociosphere.student.Student;
import com.sih.sociosphere.student.StudentRepository;
import com.sih.sociosphere.task.Task;
import com.sih.sociosphere.task.TaskRepository;
import com.sih.sociosphere.team.Team;
import com.sih.sociosphere.team.TeamMember;
import com.sih.sociosphere.team.TeamMemberRepository;
import com.sih.sociosphere.team.TeamRepository;
import com.sih.sociosphere.university.University;
import com.sih.sociosphere.university.UniversityRepository;
import com.sih.sociosphere.user.User;
import com.sih.sociosphere.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CitizenProfileRepository citizenProfileRepository;
    private final UniversityRepository universityRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final IndustryRepository industryRepository;
    private final ComplaintRepository complaintRepository;
    private final EvidenceRepository evidenceRepository;
    private final ProjectRepository projectRepository;
    private final MilestoneRepository milestoneRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TaskRepository taskRepository;
    private final IndustryPartnershipRepository partnershipRepository;
    private final FundingRepository fundingRepository;
    private final ImpactRepository impactRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CitizenProfileRepository citizenProfileRepository,
            UniversityRepository universityRepository,
            DepartmentRepository departmentRepository,
            FacultyRepository facultyRepository,
            StudentRepository studentRepository,
            IndustryRepository industryRepository,
            ComplaintRepository complaintRepository,
            EvidenceRepository evidenceRepository,
            ProjectRepository projectRepository,
            MilestoneRepository milestoneRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            TaskRepository taskRepository,
            IndustryPartnershipRepository partnershipRepository,
            FundingRepository fundingRepository,
            ImpactRepository impactRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.citizenProfileRepository = citizenProfileRepository;
        this.universityRepository = universityRepository;
        this.departmentRepository = departmentRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.industryRepository = industryRepository;
        this.complaintRepository = complaintRepository;
        this.evidenceRepository = evidenceRepository;
        this.projectRepository = projectRepository;
        this.milestoneRepository = milestoneRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.taskRepository = taskRepository;
        this.partnershipRepository = partnershipRepository;
        this.fundingRepository = fundingRepository;
        this.impactRepository = impactRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        String pass = passwordEncoder.encode("Password@123");

        // 1. Create Core Users
        User admin = createUser("Director R.K. Varma (Govt Admin)", "admin@sih.gov.in", pass, UserRole.ADMIN);
        User citizen = createUser("Rahul Sharma (Citizen)", "citizen@sih.gov.in", pass, UserRole.CITIZEN);
        User citizen2 = createUser("Pooja Deshmukh (Citizen)", "pooja@sih.gov.in", pass, UserRole.CITIZEN);

        User uUser1 = createUser("IIT Bombay Innovation Cell", "iitb@sih.gov.in", pass, UserRole.UNIVERSITY);
        User uUser2 = createUser("IIT Madras Research Park", "iitm@sih.gov.in", pass, UserRole.UNIVERSITY);
        User uUser3 = createUser("BHU Varanasi Centre of Excellence", "bhu@sih.gov.in", pass, UserRole.UNIVERSITY);
        User uUser4 = createUser("COEP Tech University Pune", "coep@sih.gov.in", pass, UserRole.UNIVERSITY);

        User fUser1 = createUser("Prof. Ananya Sharma (Faculty Mentor)", "faculty@iitb.ac.in", pass, UserRole.FACULTY);
        User fUser2 = createUser("Dr. K. Ramesh (Water Tech Lead)", "dr.ramesh@iitm.ac.in", pass, UserRole.FACULTY);
        User fUser3 = createUser("Dr. S.K. Mishra (AgriTech Specialist)", "dr.mishra@bhu.ac.in", pass, UserRole.FACULTY);

        User sUser1 = createUser("Aarav Patel (Student Lead)", "student@iitb.ac.in", pass, UserRole.STUDENT);
        User sUser2 = createUser("Sneha Reddy (Hardware Specialist)", "sneha@iitm.ac.in", pass, UserRole.STUDENT);
        User sUser3 = createUser("Vikram Deshmukh (Fullstack Developer)", "vikram@coep.ac.in", pass, UserRole.STUDENT);

        User indUser1 = createUser("Tata CSR Innovation Trust", "csr@tata.com", pass, UserRole.INDUSTRY);
        User indUser2 = createUser("Infosys Springboard Foundation", "innovations@infosys.com", pass, UserRole.INDUSTRY);
        User indUser3 = createUser("Mahindra AgriTech Ventures", "csr@mahindra.com", pass, UserRole.INDUSTRY);

        // 2. Citizen Profiles
        CitizenProfile cp = new CitizenProfile();
        cp.setUser(citizen);
        cp.setPhone("+91 98765 43210");
        cp.setDistrict("Varanasi");
        cp.setState("Uttar Pradesh");
        cp.setAddress("House 42, Kabir Nagar, Varanasi");
        cp.setVillageCity("Varanasi");
        cp.setBio("Community representative focused on local water security and rural health infrastructure.");
        citizenProfileRepository.save(cp);

        // 3. Universities & Departments
        University iitb = createUniv(uUser1, "IIT Bombay", "IITB-01", "Maharashtra", "Mumbai Suburban", "Powai, Mumbai", "Water Systems, Embedded IoT, Solar Tech, Clean Energy", 15);
        University iitm = createUniv(uUser2, "IIT Madras", "IITM-02", "Tamil Nadu", "Chennai", "Sardar Patel Rd, Chennai", "Desalination, Sensor Networks, Microgrids, Robotics", 20);
        University bhu = createUniv(uUser3, "BHU Varanasi", "BHU-03", "Uttar Pradesh", "Varanasi", "Banaras Hindu University, Varanasi", "Smart Agriculture, Waste Treatment, Environmental Biotech", 12);
        University coep = createUniv(uUser4, "COEP Technological University", "COEP-04", "Maharashtra", "Pune", "Shivajinagar, Pune", "Road Transport Safety, Smart Grid, Urban Drainage", 10);

        Department d1 = createDept(iitb, "Civil & Environmental Engineering", "CEE", "Dr. A. Verma");
        Department d2 = createDept(iitm, "Centre for Water Resources", "CWR", "Dr. S. Nathan");
        Department d3 = createDept(bhu, "Department of Agricultural Sciences", "DAS", "Dr. R. Pandey");
        Department d4 = createDept(coep, "Computer Science & Embedded Systems", "CSES", "Dr. P. Joshi");

        // 4. Faculty & Students
        Faculty fac1 = createFaculty(fUser1, iitb, d1, "Professor", "Water Quality & Decentralized Filtration", "+91 98111 22334");
        Faculty fac2 = createFaculty(fUser2, iitm, d2, "Associate Professor", "Solar Desalination & LoRa IoT Networks", "+91 98222 33445");
        Faculty fac3 = createFaculty(fUser3, bhu, d3, "Professor", "Enzymatic Stubble Decomposition", "+91 98333 44556");

        Student stu1 = createStudent(sUser1, iitb, d1, "2023CE8012", "Embedded IoT, Circuit Design, React, Python");
        Student stu2 = createStudent(sUser2, iitm, d2, "2023EE9045", "Solar Inverters, Fluid Dynamics, LoRaWAN");
        Student stu3 = createStudent(sUser3, coep, d4, "2024CS1022", "Computer Vision, Edge AI, Flutter, Spring Boot");

        // 5. Industry Partners
        Industry ind1 = createIndustry(indUser1, "Tata CSR Innovation Trust", "CSR / Social Impact", "Maharashtra", "Mumbai", "Water Security, Clean Energy, Rural Livelihoods", 2500000.0);
        Industry ind2 = createIndustry(indUser2, "Infosys Springboard Foundation", "IT & Social Innovation", "Karnataka", "Bangalore", "Smart Governance, IoT Sensor Grids, Healthcare", 1800000.0);
        Industry ind3 = createIndustry(indUser3, "Mahindra AgriTech Ventures", "AgriTech & Rural Development", "Maharashtra", "Pune", "Stubble Management, Drip Automation, Farm Equipment", 1500000.0);

        // 6. Seed Societal Challenges
        Complaint c1 = createChallenge(
                citizen,
                "Solar-Powered Coastal Groundwater Desalination & Heavy Metal Filter",
                "Severe salinity ingress and fluoride contamination in drinking borewells affecting 8 coastal hamlets. Children experiencing dental fluorosis and acute stomach ailments. Need low-cost, decentralized filtration.",
                "Water Management", "Desalination & Fluoride Removal", "Public Health",
                Priority.CRITICAL, 89.5, 3400, "Clean potable drinking water for 3,400 residents across 8 hamlets.",
                11.0168, 76.9558, "Nagapattinam Coast, Near Primary Health Center", "Nagapattinam", "Nagapattinam", "Tamil Nadu",
                ComplaintStatus.IN_PROGRESS, iitm.getId(), fac2.getId()
        );

        Complaint c2 = createChallenge(
                citizen,
                "Bio-Enzymatic In-Situ Stubble Degradation & Soil Nutrient Restorer",
                "Heavy seasonal paddy stubble burning in cluster villages causing hazardous particulate smog (AQI > 450) and soil microbial depletion. Need rapid 18-day bio-digestion spray and mechanized disperser.",
                "Smart Agriculture", "Crop Residue Management", "Environmental Hazard",
                Priority.HIGH, 78.0, 12000, "Zero open-air burning across 500+ acres, reducing winter smog by 85%.",
                31.6340, 74.8723, "Amritsar Rural, Majha Farm Cluster", "Amritsar", "Amritsar", "Punjab",
                ComplaintStatus.PROTOTYPE, bhu.getId(), fac3.getId()
        );

        Complaint c3 = createChallenge(
                citizen2,
                "Automated LiDAR & Depth Camera Pothole Mapping with Cold-Mix Rapid Patching",
                "Multiple dangerous deep potholes and unpaved asphalt craters causing fatal two-wheeler accidents and heavy monsoon waterlogging on the state arterial bypass corridor.",
                "Roads & Transport", "Road Surface Hazard", "Public Safety",
                Priority.CRITICAL, 84.0, 45000, "Rapid 15-minute patching reducing road accident fatalities by 90%.",
                18.5204, 73.8567, "Katraj-Dehu Road Bypass, Near Sinhagad Junction", "Pune", "Haveli", "Maharashtra",
                ComplaintStatus.APPROVED, coep.getId(), null
        );

        Complaint c4 = createChallenge(
                citizen,
                "Decentralized Solar Cold Storage & Micro-Grid for Tribal Fruit Farmers",
                "Over 35% seasonal harvest loss of perishable mangoes and wild berries due to zero refrigerated storage and frequent 14-hour tribal power grid outages.",
                "Clean Energy", "Solar Cold Storage", "Agricultural Livelihoods",
                Priority.HIGH, 72.0, 1850, "Extends harvest shelf life from 3 days to 28 days, increasing tribal farmer income by 40%.",
                23.3441, 85.3096, "Khunti Tribal Forest Block, 25km from Ranchi", "Ranchi", "Khunti", "Jharkhand",
                ComplaintStatus.COMPLETED, iitb.getId(), fac1.getId()
        );

        Complaint c5 = createChallenge(
                citizen,
                "IoT Acoustic Leak Detection & Pressure Optimization for Municipal Water Mains",
                "Massive underground pipeline fractures causing 40% non-revenue treated water loss and contamination during negative pressure cycles in old town wards.",
                "Water Management", "Pipeline Leakage", "Urban Infrastructure",
                Priority.MEDIUM, 58.0, 22000, "Saves 1.2 million liters of potable treated water daily.",
                25.3176, 82.9739, "Godowlia Chowk to Assi Ghat Pipeline Line", "Varanasi", "Varanasi City", "Uttar Pradesh",
                ComplaintStatus.UNDER_REVIEW, null, null
        );

        Complaint c6 = createChallenge(
                citizen2,
                "Varanasi Water Contamination near Old Town Ghats [Duplicate Report Candidate]",
                "High turbidity and brownish sewage seepage near the Assi drainage outlet creating foul smell and unhygienic bathing conditions for pilgrims.",
                "Water Management", "Sewage Seepage", "Sanitation",
                Priority.MEDIUM, 54.0, 15000, "Water quality restoration.",
                25.3190, 82.9750, "Assi Ghat Drainage Channel", "Varanasi", "Varanasi City", "Uttar Pradesh",
                ComplaintStatus.SUBMITTED, null, null
        );

        // 7. Seed Evidence Attachments
        createEvidence(c1, "coastal_borewell_salinity_sample.jpg", "image/jpeg", EvidenceType.LIVE_CAPTURE, "Field turbidity test showing TDS > 3,800 ppm in drinking borewell", EvidenceStatus.VERIFIED, "Admin Verified - Visual and GPS data match", 11.0168, 76.9558);
        createEvidence(c1, "fluoride_testing_strip.jpg", "image/jpeg", EvidenceType.IMAGE, "Chemical test strip indicating fluoride concentration > 4.2 mg/L", EvidenceStatus.VERIFIED, "Consistent lab parameters", 11.0169, 76.9559);
        createEvidence(c2, "stubble_burning_smoke_field.jpg", "image/jpeg", EvidenceType.IMAGE, "Aerial view of seasonal crop stubble fire creating thick smog cloud", EvidenceStatus.VERIFIED, "Location verified", 31.6340, 74.8723);
        createEvidence(c3, "bypass_crater_pothole_depth.jpg", "image/jpeg", EvidenceType.LIVE_CAPTURE, "Severe 18cm deep road crater on Katraj-Dehu bypass lane", EvidenceStatus.VERIFIED, "Hazard verified by traffic authority", 18.5204, 73.8567);
        createEvidence(c4, "tribal_spoilage_produce.jpg", "image/jpeg", EvidenceType.IMAGE, "Spoiled perishable produce awaiting transport under ambient heat", EvidenceStatus.VERIFIED, "Baseline verified", 23.3441, 85.3096);

        // 8. Seed Projects
        Project p1 = createProj(c1, iitm, fac2, "Smart Coastal Solar Desalination Unit", "Construct a self-cleaning, low-power membrane desalination node powered by high-efficiency bifacial solar PV.", "Bifacial Solar PV, Reverse Osmosis, Activated Carbon, ESP32, MQTT Telemetry", 450000.0, 300000.0, 6, ProjectStage.PROTOTYPE, 75);
        Project p4 = createProj(c4, iitb, fac1, "Modular 5-Tonne Solar Micro-Cold Storage", "Deploy an off-grid phase-change thermal storage cold room maintaining 4°C for 72 hours without sunshine.", "Bldc Compressors, Phase Change Material, Solar Inverter, GSM Remote Monitor", 380000.0, 380000.0, 5, ProjectStage.IMPACT, 100);

        // 9. Teams & Members
        Team t1 = new Team();
        t1.setProject(p1);
        t1.setName("AquaTech Innovators");
        t1.setLeader(stu2);
        t1.setTotalMembers(3);
        t1.setOverallProgressPercentage(75);
        teamRepository.save(t1);

        TeamMember tm1 = new TeamMember();
        tm1.setTeam(t1);
        tm1.setStudent(stu2);
        tm1.setRoleInTeam("Lead Hardware & Fluid Dynamics Engineer");
        teamMemberRepository.save(tm1);

        // 10. Tasks
        createTask(p1, null, stu2, "Fabricate Solar Desalination Membrane Housing", "Assemble CNC-milled acrylic filtration chamber with high-pressure diaphragm pump.", Priority.HIGH, TaskStatus.COMPLETED);
        createTask(p1, null, stu2, "Calibrate IoT TDS & Fluoride Sensors", "Test analog sensor response curve against known standard buffer solutions.", Priority.MEDIUM, TaskStatus.IN_PROGRESS);
        createTask(p1, null, stu2, "Develop Mobile Telemetry Alert Dashboard", "Push real-time water quality alerts to local village panchayat WhatsApp & SMS.", Priority.HIGH, TaskStatus.TODO);

        // 11. Industry Partnerships & Funding
        IndustryPartnership ip1 = new IndustryPartnership();
        ip1.setIndustry(ind1);
        ip1.setProject(p1);
        ip1.setChallenge(c1);
        ip1.setPartnershipType(PartnershipType.CSR_SPONSORSHIP);
        ip1.setFundingAmount(300000.0);
        ip1.setMentorshipScope("Clean water engineering mentorship from Tata Projects chief hydrologist.");
        ip1.setTechnologyResourcesOffered("Access to Tata Water Mission analytical laboratory in Chennai.");
        ip1.setStatus(PartnershipStatus.ACCEPTED);
        ip1.setApprovedBy("Admin");
        ip1.setApprovedAt(LocalDateTime.now().minusDays(10));
        partnershipRepository.save(ip1);

        Funding f1 = new Funding();
        f1.setProject(p1);
        f1.setSponsorName("Tata CSR Innovation Trust");
        f1.setAmount(300000.0);
        f1.setFundingStage("Phase 1 Prototype Grant");
        f1.setTransactionRef("TATA-CSR-2026-9941");
        f1.setFundingDate(LocalDate.now().minusDays(10));
        f1.setStatus(FundingStatus.DISBURSED);
        f1.setNote("Disbursed for membrane filter fabrication and solar PV kit.");
        fundingRepository.save(f1);

        // 12. Impact Metrics
        ImpactMetric im4 = new ImpactMetric();
        im4.setComplaint(c4);
        im4.setProject(p4);
        im4.setPeopleBenefited(1850);
        im4.setVillagesCovered(12);
        im4.setCostSavedInr(650000.0);
        im4.setTimeSavedHours(420.0);
        im4.setEnvironmentalImpactScore(94.0);
        im4.setJobsCreated(18);
        im4.setGovernmentEfficiencyGain(48.0);
        im4.setSocialImpactScore(92.0);
        im4.setOutcomeSummary("Deployed 2 solar cold rooms in Khunti block. Farmer spoilage dropped from 35% to under 2.4%, boosting average family income by ₹7,800/month.");
        impactRepository.save(im4);

        // 13. Notifications
        createNotification(citizen, "Challenge Update: University Assigned", "IIT Madras has accepted challenge #1: Smart Coastal Solar Desalination Unit.", NotificationType.UNIVERSITY_ASSIGNED, "/citizen/complaints/" + c1.getId());
        createNotification(admin, "New Challenge Verification Required", "Citizen Rahul Sharma submitted challenge #5: IoT Acoustic Leak Detection.", NotificationType.CHALLENGE_SUBMITTED, "/admin/complaints");
    }

    private User createUser(String name, String email, String pass, UserRole role) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(pass);
        u.setRole(role);
        u.setEnabled(true);
        return userRepository.save(u);
    }

    private University createUniv(User user, String name, String code, String state, String district, String address, String expertise, int cap) {
        University u = new University();
        u.setUser(user);
        u.setName(name);
        u.setCode(code);
        u.setState(state);
        u.setDistrict(district);
        u.setAddress(address);
        u.setContactEmail(user.getEmail());
        u.setContactPhone("+91 22 2572 2545");
        u.setWebsite("https://" + code.toLowerCase() + ".ac.in");
        u.setExpertiseAreas(expertise);
        u.setDepartmentsList("Civil, Mechanical, Computer Science, Environmental Engineering");
        u.setCapacity(cap);
        u.setActiveProjectsCount(1);
        u.setCompletedProjectsCount(2);
        u.setRating(4.9);
        u.setVerified(true);
        return universityRepository.save(u);
    }

    private Department createDept(University univ, String name, String code, String hod) {
        Department d = new Department();
        d.setUniversity(univ);
        d.setName(name);
        d.setCode(code);
        d.setHodName(hod);
        d.setHodEmail(hod.toLowerCase().replace(" ", ".") + "@" + univ.getCode().toLowerCase() + ".ac.in");
        return departmentRepository.save(d);
    }

    private Faculty createFaculty(User user, University u, Department d, String desig, String spec, String phone) {
        Faculty f = new Faculty();
        f.setUser(user);
        f.setUniversity(u);
        f.setDepartment(d);
        f.setDesignation(desig);
        f.setSpecialization(spec);
        f.setPhone(phone);
        f.setMaxMentoringCapacity(5);
        f.setActiveProjectsCount(1);
        return facultyRepository.save(f);
    }

    private Student createStudent(User user, University u, Department d, String roll, String skills) {
        Student s = new Student();
        s.setUser(user);
        s.setUniversity(u);
        s.setDepartment(d);
        s.setRollNumber(roll);
        s.setSemester(6);
        s.setDegree("B.Tech");
        s.setSkills(skills);
        return studentRepository.save(s);
    }

    private Industry createIndustry(User user, String name, String sector, String state, String district, String interests, double budget) {
        Industry ind = new Industry();
        ind.setUser(user);
        ind.setCompanyName(name);
        ind.setSector(sector);
        ind.setState(state);
        ind.setDistrict(district);
        ind.setContactPerson(user.getName());
        ind.setContactEmail(user.getEmail());
        ind.setContactPhone("+91 22 6665 8282");
        ind.setAreasOfInterest(interests);
        ind.setTotalFundingCommitted(budget);
        ind.setProjectsSupportedCount(3);
        ind.setVerified(true);
        return industryRepository.save(ind);
    }

    private Complaint createChallenge(
            User creator, String title, String desc, String cat, String subcat, String probType,
            Priority severity, double score, int pop, String impact,
            double lat, double lng, String addr, String dist, String block, String state,
            ComplaintStatus status, Long univId, Long facId
    ) {
        Complaint c = new Complaint();
        c.setCreatedBy(creator);
        c.setTitle(title);
        c.setDescription(desc);
        c.setCategory(cat);
        c.setSubcategory(subcat);
        c.setProblemType(probType);
        c.setSeverity(severity);
        c.setPriority(severity == Priority.CRITICAL ? Priority.CRITICAL : (score >= 70 ? Priority.HIGH : Priority.MEDIUM));
        c.setPriorityScore(score);
        c.setPriorityBreakdownJson("{\"severityScore\": 90, \"populationScore\": 85, \"urgencyScore\": 85, \"safetyScore\": 90, \"envScore\": 90}");
        c.setAffectedPeople(pop);
        c.setExpectedImpact(impact);
        c.setContactInfo("+91 98765 43210");
        c.setLatitude(lat);
        c.setLongitude(lng);
        c.setAddress(addr);
        c.setDistrict(dist);
        c.setBlock(block);
        c.setState(state);
        c.setVillageCity(dist);
        c.setStatus(status);
        c.setAssignedUniversityId(univId);
        c.setAssignedFacultyId(facId);
        return complaintRepository.save(c);
    }

    private void createEvidence(Complaint c, String name, String type, EvidenceType eType, String desc, EvidenceStatus status, String note, double lat, double lng) {
        Evidence e = new Evidence();
        e.setComplaint(c);
        e.setOriginalFileName(name);
        e.setContentType(type);
        e.setFileSize(2048000L);
        e.setStorageFileName(name);
        e.setFileUrl("/api/files/complaints/" + c.getId() + "/" + name);
        e.setEvidenceType(eType);
        e.setDescription(desc);
        e.setCapturedLocationLat(lat);
        e.setCapturedLocationLng(lng);
        e.setVerificationStatus(status);
        e.setVerifiedBy("Government Review Panel");
        e.setVerifiedAt(LocalDateTime.now());
        e.setVerificationNote(note);
        evidenceRepository.save(e);
    }

    private Project createProj(Complaint c, University u, Faculty f, String title, String obj, String tech, double cost, double funding, int months, ProjectStage stage, int progress) {
        Project p = new Project();
        p.setComplaint(c);
        p.setUniversity(u);
        p.setFacultyMentor(f);
        p.setTitle(title);
        p.setObjective(obj);
        p.setSolutionDescription("Comprehensive collaborative prototype developed by university team with industry mentorship.");
        p.setTechnologyStack(tech);
        p.setEstimatedCost(cost);
        p.setCurrentFunding(funding);
        p.setTimelineMonths(months);
        p.setStage(stage);
        p.setStatus(stage == ProjectStage.IMPACT ? ProjectStatus.COMPLETED : ProjectStatus.ACTIVE);
        p.setProgressPercentage(progress);
        p.setStartDate(LocalDate.now().minusMonths(months / 2));
        p.setTargetCompletionDate(LocalDate.now().plusMonths(months / 2));
        if (stage == ProjectStage.IMPACT) {
            p.setActualCompletionDate(LocalDate.now().minusDays(5));
        }
        Project saved = projectRepository.save(p);

        // Milestones
        Milestone m1 = new Milestone();
        m1.setProject(saved);
        m1.setMilestoneOrder(1);
        m1.setTitle("Phase 1: Baseline Water Sampling & Field Study");
        m1.setDescription("Completed field sensor tests across 8 coastal sites.");
        m1.setStatus(MilestoneStatus.APPROVED);
        m1.setProgressPercentage(100);
        m1.setCompletionDate(LocalDate.now().minusMonths(2));
        m1.setApprovedByFacultyName(f != null ? f.getUser().getName() : "Dr. Mentor");
        m1.setApprovedAt(LocalDateTime.now().minusMonths(2));
        milestoneRepository.save(m1);

        Milestone m2 = new Milestone();
        m2.setProject(saved);
        m2.setMilestoneOrder(2);
        m2.setTitle("Phase 2: Filtration Chamber Prototyping");
        m2.setDescription("Fabricated modular solar membrane filtration chamber.");
        m2.setStatus(stage == ProjectStage.IMPACT ? MilestoneStatus.APPROVED : MilestoneStatus.IN_PROGRESS);
        m2.setProgressPercentage(stage == ProjectStage.IMPACT ? 100 : 70);
        milestoneRepository.save(m2);

        return saved;
    }

    private void createTask(Project p, Milestone m, Student s, String title, String desc, Priority prio, TaskStatus status) {
        Task t = new Task();
        t.setProject(p);
        t.setMilestone(m);
        t.setAssignedTo(s);
        t.setTitle(title);
        t.setDescription(desc);
        t.setPriority(prio);
        t.setStatus(status);
        t.setDueDate(LocalDate.now().plusDays(10));
        taskRepository.save(t);
    }

    private void createNotification(User recipient, String title, String msg, NotificationType type, String link) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setTitle(title);
        n.setMessage(msg);
        n.setType(type);
        n.setLinkUrl(link);
        notificationRepository.save(n);
    }
}
