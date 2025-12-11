# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

# Build backend
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS backend-build
WORKDIR /app
# Copy csproj and restore dependencies
COPY TaskTracker/TaskTracker/TaskTracker.csproj .
RUN dotnet restore
# Copy everything else and build
COPY TaskTracker/TaskTracker/ ./
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app

# Copy backend files
COPY --from=backend-build /app/out ./

# Copy frontend build output to wwwroot so it can be served by ASP.NET
COPY --from=frontend-build /app/build ./wwwroot

# Expose port (ASP.NET Core will default to port 80 if not specified)
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/swagger/v1/swagger.json || exit 1

ENTRYPOINT ["dotnet", "TaskTracker.dll"]