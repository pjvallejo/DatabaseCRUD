#!/bin/bash

# Setup script for MySQL container using docker-compose
echo "🚀 Setting up MySQL container for IA_DB..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Create directories if they don't exist
mkdir -p db/init

echo "📁 Created necessary directories"

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start the MySQL container
echo "🐳 Starting MySQL container..."
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 30

# Check if MySQL is running
if docker-compose ps | grep -q "mysql_ia_db.*Up"; then
    echo "✅ MySQL container is running successfully!"
    echo "📊 Database: IA_DB"
    echo "👤 User: appuser"
    echo "🔐 Password: apppassword"
    echo "🔌 Port: 3306"
    echo ""
    echo "🔧 You can connect using:"
    echo "   Host: localhost"
    echo "   Port: 3306"
    echo "   Database: IA_DB"
    echo "   Username: appuser"
    echo "   Password: apppassword"
else
    echo "❌ Failed to start MySQL container"
    docker-compose logs mysql
    exit 1
fi

echo "🎉 Setup completed successfully!"
