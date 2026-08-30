# Production Deployment Architecture — JanNirikshan

## 1. Container Deployment
JanNirikshan is orchestrated via Docker Compose deploying four containerized services on `jannirikshan_net`:

1. `jannirikshan-postgres` (PostgreSQL 17 Alpine, Port 5432)
2. `jannirikshan-ai-service` (FastAPI + PyTorch, Port 8000)
3. `jannirikshan-backend` (Spring Boot 3.3.4, Port 8080)
4. `jannirikshan-frontend` (Nginx + React 19 SPA, Port 5173)

## 2. Production Cloud Topology
For production scale on AWS / GCP / Azure:
- **Application Services**: Deploy Backend and AI Service on Amazon ECS / EKS (Kubernetes) with auto-scaling.
- **Database**: Amazon RDS for PostgreSQL with automated Multi-AZ replication.
- **Storage**: Amazon S3 bucket with Amazon CloudFront CDN for evidence photo distribution.
- **Ingress**: AWS Application Load Balancer (ALB) terminating SSL/TLS certificates.
