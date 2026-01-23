#!/bin/bash

echo "🚀 Setting up B2B CRM..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env created${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists, skipping...${NC}"
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Start Docker services
echo -e "${BLUE}🐳 Starting Docker services...${NC}"
npm run docker:up

# Wait for PostgreSQL to be ready
echo -e "${BLUE}⏳ Waiting for PostgreSQL...${NC}"
sleep 5

# Generate Prisma client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
cd packages/database
npx prisma generate

# Run migrations
echo -e "${BLUE}🗄️ Running database migrations...${NC}"
npx prisma migrate dev

# Seed database
echo -e "${BLUE}🌱 Seeding database...${NC}"
npm run db:seed

cd ../..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo "  1. npm run dev              # Start the API server"
echo "  2. Visit http://localhost:4000/health"
echo ""
echo -e "${BLUE}🔑 Default credentials:${NC}"
echo "  Admin: admin@crm.local / admin123"
echo "  Sales: sales@crm.local / sales123"
echo ""
echo -e "${BLUE}📖 Useful commands:${NC}"
echo "  npm run db:studio           # Open Prisma Studio"
echo "  npm run docker:down         # Stop Docker services"
echo "  npm run docker:up           # Start Docker services"
echo ""
