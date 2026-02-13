#!/bin/bash

# Test script for Sprint S6: Session History and Analytics endpoints

BASE_URL="http://localhost:8000/api/v1"
EMAIL="test@example.com"
PASSWORD="testpassword123"

echo "=== Testing Sprint S6: Session History and Analytics ==="
echo ""

# Step 1: Login to get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Creating new account..."
  
  # Try to signup
  SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Test User\"}")
  
  TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo "❌ Signup also failed. Response:"
    echo $SIGNUP_RESPONSE
    exit 1
  fi
  echo "✅ Account created successfully"
fi

echo "✅ Logged in successfully"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test GET /api/v1/sessions (list sessions)
echo "2. Testing GET /api/v1/sessions (list sessions)..."
SESSIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/sessions" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo $SESSIONS_RESPONSE | python3 -m json.tool 2>/dev/null || echo $SESSIONS_RESPONSE
echo ""

# Step 3: Test GET /api/v1/sessions with filters
echo "3. Testing GET /api/v1/sessions with filters (status=draft, limit=5)..."
FILTERED_RESPONSE=$(curl -s -X GET "$BASE_URL/sessions?status=draft&limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo $FILTERED_RESPONSE | python3 -m json.tool 2>/dev/null || echo $FILTERED_RESPONSE
echo ""

# Step 4: Test GET /api/v1/sessions with search
echo "4. Testing GET /api/v1/sessions with search..."
SEARCH_RESPONSE=$(curl -s -X GET "$BASE_URL/sessions?search=authentication" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo $SEARCH_RESPONSE | python3 -m json.tool 2>/dev/null || echo $SEARCH_RESPONSE
echo ""

# Step 5: Get first session ID if available
SESSION_ID=$(echo $SESSIONS_RESPONSE | grep -o '"session_id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ ! -z "$SESSION_ID" ]; then
  echo "5. Testing GET /api/v1/sessions/{session_id} (session details)..."
  SESSION_DETAIL=$(curl -s -X GET "$BASE_URL/sessions/$SESSION_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response:"
  echo $SESSION_DETAIL | python3 -m json.tool 2>/dev/null || echo $SESSION_DETAIL
  echo ""
else
  echo "5. ⚠️  No sessions found to test session details endpoint"
  echo ""
fi

# Step 6: Test GET /api/v1/analytics
echo "6. Testing GET /api/v1/analytics (user analytics)..."
ANALYTICS_RESPONSE=$(curl -s -X GET "$BASE_URL/analytics" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo $ANALYTICS_RESPONSE | python3 -m json.tool 2>/dev/null || echo $ANALYTICS_RESPONSE
echo ""

# Step 7: Test GET /api/v1/analytics/trends
echo "7. Testing GET /api/v1/analytics/trends (performance trends)..."
TRENDS_RESPONSE=$(curl -s -X GET "$BASE_URL/analytics/trends" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo $TRENDS_RESPONSE | python3 -m json.tool 2>/dev/null || echo $TRENDS_RESPONSE
echo ""

echo "=== All Sprint S6 endpoint tests completed ==="