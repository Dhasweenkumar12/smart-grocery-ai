#!/usr/bin/env bash
# ==============================================================================
# Smart Grocery AI - 1-Click Startup Script (Linux & macOS)
# ==============================================================================

set -e

echo "===================================================================="
echo "🚀 Launching AI-Based Smart Grocery Inventory & Online Ordering System"
echo "===================================================================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH."
    echo "Please install Docker Desktop or Docker Engine and run this script again."
    exit 1
fi

echo "📦 Building & Starting Multi-Service Containers via Docker Compose..."
docker compose up -d --build

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

echo ""
echo "===================================================================="
echo "🎉 All Services Active & Healthy!"
echo "===================================================================="
echo "🌐 Web Application:       http://localhost"
echo "🔌 Backend REST API:       http://localhost:5000/api/health"
echo "🤖 Python AI Microservice: http://localhost:8001/health"
echo "🗄️  MongoDB Database:      localhost:27017"
echo "===================================================================="
echo ""
echo "🔑 Pre-Configured Demo Personas (1-Click Switcher Available in UI):"
echo " • Admin:     admin@grocery.com    / admin123"
echo " • Staff:     staff@grocery.com    / staff123"
echo " • Delivery:  delivery@grocery.com / delivery123"
echo " • Customer:  customer@gmail.com   / customer123"
echo "===================================================================="
echo ""
echo "To stop the project at any time, run: docker compose down"
