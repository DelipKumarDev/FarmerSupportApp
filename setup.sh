#!/bin/bash

# Farmer Support & Marketplace Web App - Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "=========================================="
echo "Farmer Support & Marketplace Web App"
echo "Quick Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success messages
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info messages
info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 16+"
    exit 1
fi
success "Node.js found ($(node --version))"

if ! command -v npm &> /dev/null; then
    error "npm is not installed. Please install npm"
    exit 1
fi
success "npm found ($(npm --version))"

echo ""
echo "=========================================="
echo "Step 1: Backend Setup"
echo "=========================================="
echo ""

cd backend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    info "Creating .env file from template..."
    cp .env.example .env
    success ".env file created"
    echo ""
    echo -e "${YELLOW}⚠ Please update .env file with your MongoDB Atlas credentials:${NC}"
    echo "  1. MONGODB_URI: Your MongoDB connection string"
    echo "  2. JWT_SECRET: A secure random string"
    echo ""
    echo "  Example:"
    echo "  MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/farmersupportapp"
    echo "  JWT_SECRET=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
    echo ""
else
    success ".env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    info "Installing backend dependencies..."
    npm install
    success "Backend dependencies installed"
else
    success "Backend dependencies already installed"
fi

echo ""
echo "=========================================="
echo "Step 2: Frontend Setup"
echo "=========================================="
echo ""

cd ../frontend

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    info "Creating .env file from template..."
    cp .env.example .env
    success ".env file created"
else
    success ".env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    info "Installing frontend dependencies..."
    npm install
    success "Frontend dependencies installed"
else
    success "Frontend dependencies already installed"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""

echo "Next steps:"
echo ""
echo "1. Update MongoDB Atlas credentials in backend/.env"
echo "   - Get your connection string from MongoDB Atlas"
echo "   - Update MONGODB_URI and JWT_SECRET"
echo ""
echo "2. Start the backend server:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. In a new terminal, start the frontend server:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "5. Seed the database with test data (optional):"
echo "   cd backend"
echo "   npm run seed"
echo ""
echo "Test Accounts (after seeding):"
echo "  Admin:     admin@farmerapp.com / TestPassword123"
echo "  Farmer:    farmer1@example.com / TestPassword123"
echo "  Customer:  customer1@example.com / TestPassword123"
echo ""
echo "Documentation:"
echo "  - Setup Guide:      INTEGRATION_GUIDE.md"
echo "  - Testing:         TESTING_CHECKLIST.md"
echo "  - API Endpoints:   ENDPOINTS.md"
echo "  - Frontend Docs:   FRONTEND_DOCUMENTATION.md"
echo ""

success "Setup script completed successfully!"
