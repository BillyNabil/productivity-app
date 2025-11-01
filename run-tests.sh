#!/bin/bash

# Playwright UI Design Testing - Quick Start Guide
# Run this script to execute UI design tests and generate reports

echo "🎨 Productivity App - UI Design Testing with Playwright"
echo "========================================================"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "   npm install -g pnpm"
    exit 1
fi

echo "📦 Ensuring Playwright browsers are installed..."
npx playwright install

echo ""
echo "🚀 Running UI Design Tests..."
echo ""

# Run different test suites based on user choice
if [ $# -eq 0 ]; then
    echo "Usage: ./run-tests.sh [option]"
    echo ""
    echo "Options:"
    echo "  all         - Run all tests"
    echo "  design      - Run UI design tests only"
    echo "  components  - Run UI component tests only"
    echo "  navbar      - Run navbar tests only"
    echo "  analytics   - Run analytics page tests only"
    echo "  dashboard   - Run dashboard page tests only"
    echo "  quick       - Run quick smoke tests (chromium only)"
    echo "  headed      - Run tests with visible browser"
    echo "  debug       - Run tests in debug mode"
    echo ""
    exit 0
fi

case "$1" in
    all)
        echo "Running all tests..."
        pnpm exec playwright test
        ;;
    design)
        echo "Running UI design tests..."
        pnpm exec playwright test tests/ui-design.spec.ts
        ;;
    components)
        echo "Running UI component tests..."
        pnpm exec playwright test tests/ui-components.spec.ts
        ;;
    navbar)
        echo "Running navbar tests..."
        pnpm exec playwright test tests/navbar-theme.spec.ts
        ;;
    analytics)
        echo "Running analytics page tests..."
        pnpm exec playwright test tests/ui-design.spec.ts -g "Analytics"
        ;;
    dashboard)
        echo "Running dashboard page tests..."
        pnpm exec playwright test tests/ui-design.spec.ts -g "Dashboard"
        ;;
    quick)
        echo "Running quick smoke tests (chromium only)..."
        pnpm exec playwright test tests/ui-design.spec.ts -g "Dark Theme" --project=chromium
        ;;
    headed)
        echo "Running tests with visible browser..."
        pnpm exec playwright test --headed
        ;;
    debug)
        echo "Running tests in debug mode..."
        pnpm exec playwright test --debug
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo "Run './run-tests.sh' with no arguments to see available options"
        exit 1
        ;;
esac

echo ""
echo "✅ Tests completed!"
echo ""
echo "📊 View test results:"
echo "   pnpm exec playwright show-report"
echo ""
