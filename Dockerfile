# Step 1: Build Java Spring Boot app using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Step 2: Run application with Java 17 JRE
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/hospital-management-system-1.0.0.jar app.jar

# Expose port (Render automatically sets $PORT)
EXPOSE 8080

ENV PORT=8080
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
