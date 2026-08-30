# Complete REST API Reference — JanNirikshan

## 1. Authentication Endpoints (`AuthController`)
- `POST /api/auth/login`: Authenticates user with email & password. Returns JWT token and User DTO.
- `POST /api/auth/register`: Creates new citizen account. Returns JWT token.
- `GET /api/auth/me`: Returns currently authenticated user details.

## 2. Complaint & Evidence Endpoints (`ComplaintController`, `EvidenceController`)
- `GET /api/complaints`: Returns paginated list of complaints filterable by status, priority, category.
- `POST /api/complaints`: Creates new complaint. Supports multipart/form-data with attached evidence.
- `GET /api/complaints/{id}`: Returns full complaint dossier including timeline and AI prediction metadata.
- `PATCH /api/complaints/{id}/status`: Updates complaint lifecycle status.
- `POST /api/complaints/validate-image`: Sends image to AI microservice for instant YOLOv8 validation.
- `POST /api/evidence/upload`: Attaches media evidence to an existing complaint.

## 3. AI Service Endpoints (`AiController`)
- `POST /api/ai/classify`: Classifies complaint text into one of 9 governance domains.
- `POST /api/ai/duplicate`: Calculates semantic & GPS duplicate similarity between two complaints.
- `POST /api/ai/cluster`: Groups complaints into 100m geodesic clusters.
- `POST /api/ai/priority`: Predicts priority using multi-factor tabular machine learning.
- `POST /api/ai/university-match`: Ranks universities based on domain specialization and embeddings.

## 4. University & Project Endpoints (`UniversityController`, `ProjectController`, `MilestoneController`)
- `GET /api/university/challenges`: Returns complaints escalated to university research pipeline.
- `POST /api/university/accept-challenge`: Converts a complaint into an active university R&D project.
- `GET /api/projects`: Returns active R&D collaborative projects.
- `GET /api/milestones/{projectId}`: Returns milestones for a specific project.
- `PATCH /api/milestones/{id}/status`: Updates milestone completion status.

## 5. Industry & Funding Endpoints (`IndustryController`)
- `GET /api/industry/partnerships`: Returns active industry partnerships.
- `POST /api/industry/partnerships/express-interest`: Registers CSR sponsorship or technical co-development.

## 6. File Serving (`FileController`)
- `GET /api/files/{id}`: Streams binary image/PDF file from persistent storage.
- `GET /api/uploads/{filename}`: Direct stream endpoint for evidence media.
