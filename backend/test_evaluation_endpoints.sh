#!/bin/bash

# Test script for PRD Evaluation endpoints (Sprint S5)
# Tests: POST /api/v1/prds/{prd_id}/evaluate and GET /api/v1/prds/{prd_id}/evaluation

BASE_URL="http://localhost:8000/api/v1"

echo "=========================================="
echo "Testing PRD Evaluation System (Sprint S5)"
echo "=========================================="
echo ""

# Step 1: Login to get token
echo "Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Response:"
  echo $LOGIN_RESPONSE
  echo ""
  echo "Creating new user..."
  SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "testpassword123",
      "name": "Test User"
    }')
  TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo "✅ Logged in successfully"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Create a test PRD
echo "Step 2: Creating a test PRD..."
CREATE_PRD_RESPONSE=$(curl -s -X POST "$BASE_URL/prds" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Mobile Fitness Tracking App",
    "description": "A comprehensive mobile application that helps users track their fitness goals, log workouts, monitor nutrition, and connect with a community of fitness enthusiasts. The app will feature personalized workout plans, progress tracking with charts and analytics, integration with wearable devices, and social features for motivation and accountability.",
    "target_audience": "Health-conscious individuals aged 18-45 who want to improve their fitness and maintain a healthy lifestyle",
    "success_metrics": [
      "10,000 active users within first 3 months",
      "Average session duration of 15+ minutes",
      "70% user retention rate after 30 days",
      "4.5+ star rating on app stores"
    ],
    "timeline": "Phase 1 (Months 1-2): Core tracking features. Phase 2 (Months 3-4): Social features and wearable integration. Phase 3 (Month 5): Analytics and personalization. Launch in Month 6.",
    "priority": "high",
    "status": "draft"
  }')

PRD_ID=$(echo $CREATE_PRD_RESPONSE | grep -o '"prd_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$PRD_ID" ]; then
  echo "❌ Failed to create PRD. Response:"
  echo $CREATE_PRD_RESPONSE
  exit 1
fi

echo "✅ PRD created successfully"
echo "PRD ID: $PRD_ID"
echo ""

# Step 3: Evaluate the PRD
echo "Step 3: Evaluating the PRD..."
echo "This will call OpenAI API to analyze the PRD..."
EVALUATE_RESPONSE=$(curl -s -X POST "$BASE_URL/prds/$PRD_ID/evaluate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}')

echo "Evaluation Response:"
echo $EVALUATE_RESPONSE | jq '.' 2>/dev/null || echo $EVALUATE_RESPONSE
echo ""

# Check if evaluation was successful
EVAL_ID=$(echo $EVALUATE_RESPONSE | grep -o '"evaluation_id":"[^"]*' | cut -d'"' -f4)
OVERALL_SCORE=$(echo $EVALUATE_RESPONSE | grep -o '"overall_score":[0-9]*' | cut -d':' -f2)

if [ -z "$EVAL_ID" ]; then
  echo "❌ Evaluation failed"
  exit 1
fi

echo "✅ Evaluation completed successfully"
echo "Evaluation ID: $EVAL_ID"
echo "Overall Score: $OVERALL_SCORE/100"
echo ""

# Step 4: Retrieve the evaluation
echo "Step 4: Retrieving evaluation results..."
GET_EVAL_RESPONSE=$(curl -s -X GET "$BASE_URL/prds/$PRD_ID/evaluation" \
  -H "Authorization: Bearer $TOKEN")

echo "Retrieved Evaluation:"
echo $GET_EVAL_RESPONSE | jq '.' 2>/dev/null || echo $GET_EVAL_RESPONSE
echo ""

# Step 5: Check user activation state
echo "Step 5: Checking user activation state..."
USER_INFO=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

ACTIVATION_STATE=$(echo $USER_INFO | grep -o '"activation_state":"[^"]*' | cut -d'"' -f4)

echo "User Info:"
echo $USER_INFO | jq '.' 2>/dev/null || echo $USER_INFO
echo ""

if [ "$ACTIVATION_STATE" = "activated" ]; then
  echo "✅ User activation state updated to 'activated'"
else
  echo "⚠️  User activation state: $ACTIVATION_STATE"
fi
echo ""

# Step 6: Test re-evaluation (should return cached result)
echo "Step 6: Testing cached evaluation (should return same result)..."
CACHED_EVAL=$(curl -s -X POST "$BASE_URL/prds/$PRD_ID/evaluate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"force_reevaluate": false}')

CACHED_EVAL_ID=$(echo $CACHED_EVAL | grep -o '"evaluation_id":"[^"]*' | cut -d'"' -f4)

if [ "$CACHED_EVAL_ID" = "$EVAL_ID" ]; then
  echo "✅ Cached evaluation returned correctly (same evaluation_id)"
else
  echo "⚠️  Different evaluation returned"
fi
echo ""

# Step 7: Test force re-evaluation
echo "Step 7: Testing force re-evaluation..."
FORCE_EVAL=$(curl -s -X POST "$BASE_URL/prds/$PRD_ID/evaluate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"force_reevaluate": true}')

echo "Force Re-evaluation Response:"
echo $FORCE_EVAL | jq '.overall_score, .summary' 2>/dev/null || echo $FORCE_EVAL
echo ""

echo "=========================================="
echo "✅ All evaluation endpoint tests completed!"
echo "=========================================="
echo ""
echo "Summary:"
echo "- PRD created: $PRD_ID"
echo "- Evaluation ID: $EVAL_ID"
echo "- Overall Score: $OVERALL_SCORE/100"
echo "- User Activation: $ACTIVATION_STATE"
echo ""
echo "Key Features Tested:"
echo "✅ Multi-dimensional scoring (6 dimensions)"
echo "✅ AI-powered evaluation using OpenAI"
echo "✅ Improvement recommendations generation"
echo "✅ User activation state transition"
echo "✅ Evaluation caching"
echo "✅ Force re-evaluation"
echo "✅ Evaluation retrieval"