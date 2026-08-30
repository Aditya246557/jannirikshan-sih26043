# JANNIRIKSHAN (SIH26043) — DOCKER DEPLOYMENT & RUNBOOK

Production-ready multi-container orchestration for the complete JanNirikshan platform.

---

## 1. Architecture Overview

| Service | Container Name | Technology | Port (Host:Container) | Internal DNS Name | Health Check Endpoint |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **PostgreSQL** | `jannirikshan-postgres` | PostgreSQL 17 Alpine | 5432:5432 | `postgres` | `pg_isready -U postgres -d sih26043` |
| **AI Microservice** | `jannirikshan-ai-service` | FastAPI, PyTorch, YOLOv8 | 8000:8000 | `ai-service` | GET `http://localhost:8000/health` |
| **Backend API** | `jannirikshan-backend` | Spring Boot 3.3.4 (Java 17) | 8080:8080 | `backend` | GET `http://localhost:8080/api/actuator/health` |
| **Frontend Web** | `jannirikshan-frontend` | React 18, Vite, Nginx | 5173:5173 | `frontend` | GET `http://localhost:5173/` |

---

## 2. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / macOS / Linux) with Docker Compose v2+.
- Minimum 4 GB RAM allocated to Docker engine.

---

## 3. Quick Start (One Command)

To build all container images and launch the entire stack in the foreground:

`powershell
docker compose up --build
`

Or to start in detached background mode:

`powershell
docker compose up -d --build
`

Once started, access the platform at:
- **Frontend Portal**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Swagger/Actuator**: [http://localhost:8080/api/actuator/health](http://localhost:8080/api/actuator/health)
- **FastAPI AI Engine**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4. Daily Operations

### Start Containers (Daily Run)
`powershell
docker compose up -d
`

### Stop Containers (Preserving Database Volume)
`powershell
docker compose down
`
> **Warning**: Never use docker compose down -v unless you explicitly want to wipe the persistent database volume.

### View Service Logs
`powershell
# View all logs in real-time
docker compose logs -f

# View backend logs specifically
docker compose logs -f backend

# View AI microservice logs
docker compose logs -f ai-service

# View frontend logs
docker compose logs -f frontend
`

### Check Container Status
`powershell
docker compose ps
`

### Rebuild Specific Service
`powershell
docker compose up -d --build backend
`

---

## 5. Persistent Storage & Backups

- **Database Volume**: sociosphere_postgres_data (stores all PostgreSQL table records and audit trails).
- **Uploads Volume**: sociosphere_uploads_data (stores citizen survey photos and project evidence).
- **Initial Database Seed**: database/init.sql automatically initializes new volumes with full canonical data.

---

## 6. Local Non-Docker Development

Local development without Docker continues to work out of the box with zero modifications:

`powershell
# Terminal 1: Backend
cd backend
java -jar target/SIH26043-0.0.1-SNAPSHOT.jar

# Terminal 2: AI Service
cd ai_service
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 127.0.0.1 --port 8000

# Terminal 3: Frontend
cd frontend
npm run dev
`
