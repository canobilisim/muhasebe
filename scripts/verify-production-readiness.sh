#!/bin/bash

# Production Readiness Verification Script
# This script checks if the application is ready for production deployment

echo "🔍 Production Readiness Verification"
echo "===================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print status
print_status() {
  if [ "$1" == "pass" ]; then
    echo -e "${GREEN}✅ $2${NC}"
    ((PASSED++))
  elif [ "$1" == "fail" ]; then
    echo -e "${RED}❌ $2${NC}"
    ((FAILED++))
  elif [ "$1" == "warn" ]; then
    echo -e "${YELLOW}⚠️  $2${NC}"
    ((WARNINGS++))
  else
    echo "ℹ️  $2"
  fi
}

# 1. Check if .env.production exists
echo "1️⃣  Checking environment configuration..."
if [ -f ".env.production" ]; then
  print_status "pass" ".env.production file exists"
else
  print_status "warn" ".env.production file not found (optional)"
fi

# 2. Check for service role key in production env
if [ -f ".env.production" ]; then
  if grep -q "VITE_SUPABASE_SERVICE_ROLE_KEY" .env.production; then
    print_status "fail" "Service role key found in .env.production! Remove it!"
  else
    print_status "pass" "No service role key in .env.production"
  fi
fi

# 3. Check if .env is in .gitignore
echo ""
echo "2️⃣  Checking .gitignore..."
if grep -q "^\.env$" .gitignore; then
  print_status "pass" ".env is in .gitignore"
else
  print_status "fail" ".env is NOT in .gitignore"
fi

# 4. Check debug panel implementation
echo ""
echo "3️⃣  Checking debug panel implementation..."
if grep -q "import.meta.env.DEV" src/App.tsx; then
  print_status "pass" "Debug panel uses environment check"
else
  print_status "fail" "Debug panel missing environment check"
fi

# 5. Check error handler implementation
echo ""
echo "4️⃣  Checking error handler..."
if grep -q "isDevelopment()" src/lib/auth-error-handler.ts; then
  print_status "pass" "Error handler has isDevelopment() method"
else
  print_status "fail" "Error handler missing isDevelopment() method"
fi

# 6. Check LoginPage error display
echo ""
echo "5️⃣  Checking LoginPage error display..."
if grep -q "isDevelopment && lastError" src/pages/LoginPage.tsx; then
  print_status "pass" "LoginPage conditionally shows developer details"
else
  print_status "fail" "LoginPage missing conditional error display"
fi

# 7. Try to build for production
echo ""
echo "6️⃣  Building for production..."
if npm run build > /dev/null 2>&1; then
  print_status "pass" "Production build successful"
  
  # Check bundle size
  if [ -d "dist/assets" ]; then
    MAIN_JS_SIZE=$(du -sh dist/assets/index-*.js 2>/dev/null | cut -f1 | head -1)
    if [ -n "$MAIN_JS_SIZE" ]; then
      echo "   📦 Main bundle size: $MAIN_JS_SIZE"
    fi
  fi
else
  print_status "fail" "Production build failed"
fi

# 8. Check for console.log in source (warning only)
echo ""
echo "7️⃣  Checking for console.log statements..."
CONSOLE_COUNT=$(grep -r "console\.log" src/ --include="*.tsx" --include="*.ts" | grep -v "// console.log" | wc -l)
if [ "$CONSOLE_COUNT" -gt 0 ]; then
  print_status "warn" "Found $CONSOLE_COUNT console.log statements in source code"
  echo "   💡 Consider removing or wrapping in isDevelopment checks"
else
  print_status "pass" "No console.log statements found"
fi

# 9. Check TypeScript configuration
echo ""
echo "8️⃣  Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
  if grep -q '"strict": true' tsconfig.json; then
    print_status "pass" "TypeScript strict mode enabled"
  else
    print_status "warn" "TypeScript strict mode not enabled"
  fi
fi

# 10. Check for TODO/FIXME comments
echo ""
echo "9️⃣  Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ --include="*.tsx" --include="*.ts" | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
  print_status "warn" "Found $TODO_COUNT TODO/FIXME comments"
  echo "   💡 Review and resolve before production deployment"
else
  print_status "pass" "No TODO/FIXME comments found"
fi

# Summary
echo ""
echo "===================================="
echo "📊 Summary"
echo "===================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 Production readiness check passed!${NC}"
  echo ""
  echo "📋 Next steps:"
  echo "1. Review PRODUCTION_READINESS_CHECKLIST.md"
  echo "2. Configure Supabase for production (email confirmation, site URLs)"
  echo "3. Set environment variables on deployment platform"
  echo "4. Test on staging environment"
  echo "5. Deploy to production"
  exit 0
else
  echo -e "${RED}❌ Production readiness check failed!${NC}"
  echo ""
  echo "Please fix the failed checks before deploying to production."
  exit 1
fi
