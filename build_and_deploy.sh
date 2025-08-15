#!/bin/bash

# iSly Platform Docker Build and Deploy Script
set -e

echo "🚀 Starting iSly Platform Docker Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Create necessary directories
mkdir -p logs
mkdir -p docker/db

echo "📁 Created necessary directories"

# Build all Docker images
echo "🔨 Building Docker images..."
docker compose --env-file .env.docker build --no-cache

echo "✅ Docker images built successfully"

# Start all services
echo "🚀 Starting all services..."
docker compose --env-file .env.docker up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker compose ps

echo "🏥 Running health checks..."

# Wait for web service to be ready
echo "⏳ Waiting for web service to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Web service is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Web service failed to start"
        docker compose logs web
        exit 1
    fi
    sleep 2
done

# Check database
echo "🗄️ Checking database connection..."
if docker exec -it isly-postgres pg_isready -U isly_user > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not ready"
    docker compose logs postgres
fi

# Check Redis
echo "📦 Checking Redis connection..."
if docker exec -it isly-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
    docker compose logs redis
fi

echo ""
echo "🎉 iSly Platform deployed successfully!"
echo ""
echo "📍 Access Points:"
echo "   Web Application: http://localhost:3000"
echo "   Health Check: http://localhost:3000/api/health"
echo "   Database: localhost:5432 (user: isly_user)"
echo "   Redis: localhost:6379"
echo ""
echo "📋 Useful Commands:"
echo "   View logs: docker compose logs -f"
echo "   Stop services: docker compose down"
echo "   Restart: docker compose restart"
echo ""
echo "✅ Deployment complete!"
