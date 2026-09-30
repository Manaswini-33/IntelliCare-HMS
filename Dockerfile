# Fast & Reliable Runtime Image for Render (Pre-compiled Spring Boot Jar)
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy pre-compiled executable Spring Boot Jar
COPY target/hospital-management-system-1.0.0.jar app.jar

# Expose port (Render automatically sets $PORT)
EXPOSE 8080

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=h2

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-h2} -jar app.jar"]
