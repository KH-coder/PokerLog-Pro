# PokerLog-Pro Docker Setup

This document provides instructions for running the PokerLog-Pro application using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git (to clone the repository if needed)

## Components

The Docker Compose setup includes the following services:

1. **PostgreSQL Database** - Stores all application data
2. **API Server** - .NET Core backend API

## Configuration

The configuration is defined in the `docker-compose.yml` file. Key configuration items:

- PostgreSQL credentials (username, password, database name)
- API connection strings and JWT settings
- Port mappings

## Getting Started

### Build and Start the Services

```bash
# Navigate to the project directory
cd /path/to/PokerLog-Pro/poker-tracker-server

# Build and start all services in detached mode
docker-compose up -d
```

### Stopping the Services

```bash
docker-compose down
```

### View Logs

```bash
# View logs from all services
docker-compose logs

# View logs from a specific service
docker-compose logs api
docker-compose logs postgres
```

## Accessing the Services

- **API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger
- **PostgreSQL**: localhost:5432 (Use a PostgreSQL client to connect)

## Data Persistence

The PostgreSQL data is persisted in a Docker volume named `postgres-data`. This ensures that your data remains intact even if the containers are stopped or removed.

## Troubleshooting

### Database Connection Issues

If the API cannot connect to the database, ensure:

1. The PostgreSQL container is running: `docker-compose ps`
2. The connection string in the API environment variables matches the PostgreSQL credentials

### Container Startup Issues

If containers fail to start properly:

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs
```

## Customization

To modify the configuration:

1. Edit the `docker-compose.yml` file to change service settings
2. Rebuild and restart the services: `docker-compose up -d --build`
