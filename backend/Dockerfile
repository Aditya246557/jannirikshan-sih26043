# ============================================================
# STAGE 1: BUILD SPRING BOOT APPLICATION
# ============================================================
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy pom.xml and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
# STAGE 2: PRODUCTION RUNTIME
# ============================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

# Create directory for persistent uploads and copy existing evidence
RUN mkdir -p /app/uploads/complaints
COPY uploads /app/uploads

# Copy jar from builder stage
COPY --from=builder /app/target/SIH26043-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
