# Frontend Architecture — React 19 & Vite SPA

## 1. Overview
The JanNirikshan web frontend is built using React 19.1.1 and bundled with Vite 7.1.3.

## 2. Directory Structure
```
frontend/src/
├── context/
│   ├── AuthContext.jsx      # Authentication state, JWT parsing, localStorage persistence
│   └── AppContext.jsx       # Global application state (notifications, current active role)
├── services/
│   ├── api.js               # Central Axios client with Bearer JWT interceptor
│   ├── authService.js       # Login, register, profile fetching
│   ├── complaintService.js  # Complaint CRUD, public exploration, status updates
│   ├── evidenceService.js   # Image validation and file upload
│   ├── aiService.js         # Direct AI integration methods
│   ├── universityService.js # University challenge acceptance and catalog
│   ├── projectService.js    # R&D project lifecycle management
│   ├── milestoneService.js  # Project milestones and deliverables
│   └── industryService.js   # CSR partnerships and grant commitments
├── components/
│   ├── map/                 # Leaflet interactive maps and custom markers
│   ├── evidence/            # Photo gallery, verification modal, camera capture
│   ├── layout/              # Sidebar, Navbar, PageHeader, CitizenLayout
│   └── common/              # ProtectedRoute, Modal, Button, Input, Loading
└── pages/                   # 13 Role-specific view modules (Admin, Citizen, Faculty, etc.)
```

## 3. Route & Role Matrix
- `/login`, `/register`: Public authentication views.
- `/citizen/*`: Citizen dashboard, complaint submission, personal complaint dossier, community map.
- `/admin/*`: Administrator triage, municipal complaint queue, system audit logs, department stats.
- `/university/*`: University challenge browsing, proposal submissions, faculty workload management.
- `/faculty/*`: Principal Investigator project board, milestone reviews, student recruitment.
- `/student/*`: Student research task workspace, deliverable submission.
- `/industry/*`: Corporate CSR marketplace, partnership pledges, impact metrics.
