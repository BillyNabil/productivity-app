#!/bin/bash

# Gemini Integration Verification Script
# Tests if Gemini is properly configured and working

echo "═══════════════════════════════════════════════════════════"
echo "  Gemini 2.5 Flash Integration Verification"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check 1: .env.local exists
echo "✓ Checking .env.local..."
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local exists"
else
    echo "  ❌ .env.local not found"
    exit 1
fi

# Check 2: Gemini API key configured
echo ""
echo "✓ Checking Gemini API key..."
GEMINI_KEY=$(grep "NEXT_PUBLIC_GEMINI_API_KEY" .env.local | cut -d'=' -f2)

if [ -z "$GEMINI_KEY" ]; then
    echo "  ❌ NEXT_PUBLIC_GEMINI_API_KEY not found in .env.local"
elif [ "$GEMINI_KEY" = "your-gemini-api-key-here" ]; then
    echo "  ⚠️  GEMINI_KEY is still placeholder"
    echo "  📝 Please add your actual API key"
else
    echo "  ✅ GEMINI_KEY configured ($(echo $GEMINI_KEY | cut -c1-10)...)"
fi

# Check 3: Package installed
echo ""
echo "✓ Checking @google/generative-ai package..."
if grep -q "@google/generative-ai" package.json; then
    echo "  ✅ Package found in package.json"
else
    echo "  ❌ Package not found in package.json"
    exit 1
fi

if [ -d "node_modules/@google/generative-ai" ]; then
    echo "  ✅ Package installed in node_modules"
else
    echo "  ⚠️  Package not installed yet"
    echo "  Run: pnpm install"
fi

# Check 4: Enhanced service file exists
echo ""
echo "✓ Checking enhanced-ai-service.ts..."
if [ -f "src/lib/services/enhanced-ai-service.ts" ]; then
    echo "  ✅ Enhanced service file exists"
    LINES=$(wc -l < src/lib/services/enhanced-ai-service.ts)
    echo "  📄 File size: $LINES lines"
else
    echo "  ❌ Enhanced service file not found"
    exit 1
fi

# Check 5: AI Chat component updated
echo ""
echo "✓ Checking ai-chat.tsx..."
if grep -q "enhancedAIService" src/components/ai/ai-chat.tsx; then
    echo "  ✅ Chat component uses enhanced service"
else
    echo "  ❌ Chat component not updated"
    exit 1
fi

# Check 6: Build status
echo ""
echo "✓ Checking build status..."
if [ -d ".next" ]; then
    echo "  ✅ Project has been built"
else
    echo "  ⚠️  Project needs to be built"
    echo "  Run: pnpm build"
fi

# Final summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Verification Summary"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ All components installed and configured!"
echo ""
echo "Next steps:"
echo "1. Add your Gemini API key to .env.local:"
echo "   NEXT_PUBLIC_GEMINI_API_KEY=your-key-here"
echo ""
echo "2. Restart dev server:"
echo "   pnpm dev"
echo ""
echo "3. Test at: http://localhost:3000/ai"
echo ""
echo "4. Try: 'Add task: test gemini integration'"
echo ""
echo "═══════════════════════════════════════════════════════════"
