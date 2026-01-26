#!/bin/bash

echo "[START] Setting up B2B CRM..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${BLUE}[INFO] Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}[OK] .env created${NC}"
else
    echo -e "${YELLOW}[WARN] .env already exists, skipping...${NC}"
fi

# Install dependencies
echo -e "${BLUE}[DATA] Installing dependencies...${NC}"
npm install

# Start Docker services
echo -e "${BLUE}[INFO] Starting Docker services...${NC}"
npm run docker:up

# Wait for PostgreSQL to be ready
echo -e "${BLUE}[INFO] Waiting for PostgreSQL...${NC}"
sleep 5

# Generate Prisma client
echo -e "${BLUE}[INFO] Generating Prisma client...${NC}"
cd packages/database
npx prisma generate

# Run migrations
echo -e "${BLUE}[INFO] Running database migrations...${NC}"
npx prisma migrate dev

# Seed database
echo -e "${BLUE}[INFO] Seeding database...${NC}"
npm run db:seed

cd ../..

echo ""
echo -e "${GREEN}[SUCCESS] Setup complete!${NC}"
echo ""
echo -e "${BLUE}[INFO] Next steps:${NC}"
echo "  1. npm run dev              # Start the API server"
echo "  2. Visit http://localhost:4000/health"
echo ""
echo -e "${BLUE}[INFO] Default credentials:${NC}"
echo "  Admin: admin@crm.local / admin123"
echo "  Sales: sales@crm.local / sales123"
echo ""
echo -e "${BLUE}[INFO] Useful commands:${NC}"
echo "  npm run db:studio           # Open Prisma Studio"
echo "  npm run docker:down         # Stop Docker services"
echo "  npm run docker:up           # Start Docker services"
echo ""
