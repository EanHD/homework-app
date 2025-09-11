#!/bin/bash
set -e

# CI Test Runner Script
# Runs both unit and E2E tests with proper CI configuration

echo "🧪 Running CI Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in CI environment
if [ "$CI" = "true" ]; then
    echo "🏗️  CI Environment detected"
    export PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/playwright"
else
    echo "💻 Local development environment"
fi

echo ""
echo "📋 Test Plan:"
echo "  1. Unit tests (Vitest)"
echo "  2. E2E tests (Playwright)"
echo ""

# Function to run unit tests
run_unit_tests() {
    echo -e "${YELLOW}1. Running unit tests...${NC}"
    if npm test; then
        echo -e "${GREEN}✅ Unit tests passed${NC}"
        return 0
    else
        echo -e "${RED}❌ Unit tests failed${NC}"
        return 1
    fi
}

# Function to run E2E tests
run_e2e_tests() {
    echo -e "${YELLOW}2. Running E2E tests...${NC}"
    
    # Install browsers if needed
    if [ "$CI" = "true" ]; then
        echo "📥 Installing Playwright browsers..."
        npx playwright install --with-deps chromium firefox
    fi
    
    # Build app first
    echo "🔨 Building application..."
    if npm run build; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        return 1
    fi
    
    # Run E2E tests
    if [ "$CI" = "true" ]; then
        # CI: Run on chromium and firefox only
        npx playwright test --project=chromium --project=firefox
    else
        # Local: Run all configured browsers
        npx playwright test
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ E2E tests passed${NC}"
        return 0
    else
        echo -e "${RED}❌ E2E tests failed${NC}"
        return 1
    fi
}

# Main execution
UNIT_RESULT=0
E2E_RESULT=0

run_unit_tests || UNIT_RESULT=1
echo ""
run_e2e_tests || E2E_RESULT=1

echo ""
echo "📊 Test Summary:"
if [ $UNIT_RESULT -eq 0 ]; then
    echo -e "  Unit tests: ${GREEN}✅ PASSED${NC}"
else
    echo -e "  Unit tests: ${RED}❌ FAILED${NC}"
fi

if [ $E2E_RESULT -eq 0 ]; then
    echo -e "  E2E tests:  ${GREEN}✅ PASSED${NC}"
else
    echo -e "  E2E tests:  ${RED}❌ FAILED${NC}"
fi

# Exit with error if any tests failed
if [ $UNIT_RESULT -ne 0 ] || [ $E2E_RESULT -ne 0 ]; then
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
else
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
fi