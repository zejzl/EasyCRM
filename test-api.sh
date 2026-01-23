#!/bin/bash

# API Test Examples for B2B CRM
# Make sure the API server is running (npm run dev) before running these tests

API_URL="http://localhost:4000"
TOKEN=""

echo "🧪 Testing B2B CRM API"
echo ""

# Test 1: Health Check
echo "1. Testing health endpoint..."
curl -s "${API_URL}/health" | jq '.'
echo ""

# Test 2: Login
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@crm.local",
    "password": "admin123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test 3: Get current user
echo "3. Testing get current user..."
curl -s "${API_URL}/api/users/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 4: List companies
echo "4. Testing list companies..."
curl -s "${API_URL}/api/companies?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, name, industry}'
echo ""

# Test 5: Get analytics overview
echo "5. Testing analytics overview..."
curl -s "${API_URL}/api/analytics/overview" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 6: Get pipeline
echo "6. Testing pipeline view..."
curl -s "${API_URL}/api/deals/pipeline" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {name, order, dealsCount: (.deals | length)}'
echo ""

# Test 7: Create a new company
echo "7. Testing create company..."
NEW_COMPANY=$(curl -s -X POST "${API_URL}/api/companies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Corp",
    "domain": "testcorp.example.com",
    "industry": "Technology",
    "size": "SMALL"
  }')

echo "$NEW_COMPANY" | jq '.'
COMPANY_ID=$(echo "$NEW_COMPANY" | jq -r '.id')
echo ""

# Test 8: Search companies
echo "8. Testing search companies..."
curl -s "${API_URL}/api/companies/search/query?q=Tech" \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {name, domain}'
echo ""

# Test 9: Get specific company
if [ -n "$COMPANY_ID" ] && [ "$COMPANY_ID" != "null" ]; then
  echo "9. Testing get company by ID..."
  curl -s "${API_URL}/api/companies/${COMPANY_ID}" \
    -H "Authorization: Bearer $TOKEN" | jq '{id, name, industry, contactsCount: (.contacts | length)}'
  echo ""
fi

echo "✅ API tests complete!"
echo ""
echo "💡 Tips:"
echo "  - Use 'jq' for better JSON formatting (install with: apt-get install jq)"
echo "  - Check the API logs for detailed request information"
echo "  - Open Prisma Studio to visualize the database: npm run db:studio"
