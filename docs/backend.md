# Backend Architecture — Spring Boot 3.3.4 (Java 17)

## 1. Overview
The JanNirikshan backend is an enterprise Spring Boot 3.3.4 service running on Java 17.

## 2. Key Modules & Packages
```
com.jannirikshan/
├── admin/          # AdminController & AdminService
├── ai/             # AiClient (RestTemplate to FastAPI), AiController, AiService
├── analytics/      # AnalyticsController & metrics aggregation
├── audit/          # AuditLog entity, repository, and service
├── auth/           # AuthController, AuthService, login/register DTOs
├── citizen/        # CitizenController & CitizenProfile
├── complaint/      # Complaint entity, controller, service, repository
├── config/         # SecurityConfig, CorsConfig, StorageConfig, DataInitializer
├── evidence/       # Evidence entity, controller, service, repository
├── faculty/        # Faculty entity, controller, service, repository
├── file/           # FileController (binary file serving)
├── industry/       # Industry & IndustryPartnership entities and controllers
├── milestone/      # Milestone entity, controller, service, repository
├── notification/   # Notification entity, controller, service, repository
├── project/        # Project, Document, Funding entities and controllers
├── proposal/       # Proposal entity, controller, service, repository
├── security/       # JwtAuthFilter, JwtService, CustomUserDetailsService
├── student/        # Student entity, controller, service, repository
├── university/     # University entity, controller, service, repository
└── user/           # User entity, controller, service, repository
```

## 3. Security Filter Chain
1. HTTP requests arrive at port 8080.
2. `CorsConfig` applies verified origins (`localhost:5173`, `127.0.0.1:5173`).
3. `JwtAuthFilter` extracts `Authorization: Bearer <token>`, validates HMAC-SHA256 signature, and sets `SecurityContextHolder.getContext().setAuthentication(auth)`.
4. Role-based authorization rules in `SecurityConfig` verify access to protected paths (`/admin/**`, `/university/**`, `/industry/**`).
