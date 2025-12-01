FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
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
COPY --from=build /app/out ./

# Expose port (ASP.NET Core will default to port 80 if not specified)
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/swagger/v1/swagger.json || exit 1

ENTRYPOINT ["dotnet", "TaskTracker.dll"]