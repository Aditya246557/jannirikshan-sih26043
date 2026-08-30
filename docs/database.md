# Database Architecture — PostgreSQL 17

## 1. Overview
The JanNirikshan persistence layer uses PostgreSQL 17 Alpine configured in Docker.

## 2. Table Catalog
1. `users`: Core identity, roles, passwords (`BCrypt`).
2. `citizen_profiles`: Extended citizen addresses, district, state, trust rating.
3. `complaints`: Core civic issues, category, priority, status, latitude, longitude, tracking numbers.
4. `complaint_evidence`: File paths, sizes, MIME types, AI verification tags.
5. `ai_predictions`: Stored AI inference outputs and raw telemetry.
6. `challenge_duplicates`: Graph of duplicate relations with similarity scores.
7. `universities`: Pre-configured demo universities (IIT Bombay, IIT Madras, IIT BHU, BITS Pilani).
8. `faculty_members`: University professors & principal investigators.
9. `students`: Enrolled student researchers.
10. `projects`: Active R&D collaborative projects.
11. `project_milestones`: Project milestone deliverables and deadlines.
12. `proposals`: Research proposals submitted against challenges.
13. `industries`: Industrial partners and corporate entities.
14. `industry_partnerships`: Active partnerships, types, commitment amounts.
15. `project_funding`: Grant allocations and disbursement references.
16. `notifications`: Notification inbox for all users.
17. `audit_logs`: Administrative and security action logs.
