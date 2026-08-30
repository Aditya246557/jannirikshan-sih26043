# Local Development Guide — JanNirikshan

## 1. Prerequisites
- Java Development Kit (JDK 17)
- Maven 3.9+
- Node.js 20+ & npm
- Python 3.11+
- Flutter 3.13+
- Docker Desktop & Docker Compose

## 2. Quick Start
```bash
# 1. Clone repository
git clone https://github.com/<your-username>/jannirikshan-sih26043.git
cd jannirikshan-sih26043

# 2. Setup environment variables
cp .env.example .env

# 3. Start all microservices with Docker
docker compose up -d

# 4. Access Web Application
# Open http://localhost:5173 in browser

# 5. Access Mobile Application
cd mobile_citizen
flutter pub get
flutter run
```
