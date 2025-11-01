#!/usr/bin/env bash
# ============================================
# Chat Template System - Setup Verification
# ============================================
# Run this script to verify all files were created correctly

echo "🔍 Verifying Chat Template System Setup..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

MISSING=0
FOUND=0

# Check functions
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((FOUND++))
    else
        echo -e "${RED}✗${NC} $1"
        ((MISSING++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((FOUND++))
    else
        echo -e "${RED}✗${NC} $1/"
        ((MISSING++))
    fi
}

echo "📁 Checking Directories..."
check_dir "src/lib/templates"
check_dir "src/components/ai"
echo ""

echo "📄 Checking Template System Files..."
check_file "src/lib/templates/chat-templates.ts"
check_file "src/lib/templates/chat-template-engine.ts"
check_file "src/lib/templates/examples.ts"
check_file "src/lib/templates/index.ts"
echo ""

echo "🎨 Checking UI Components..."
check_file "src/components/ai/template-picker.tsx"
check_file "src/components/ai/ai-chat-with-templates.tsx"
echo ""

echo "📚 Checking Documentation..."
check_file "TEMPLATE_SYSTEM_README.md"
check_file "TEMPLATE_SYSTEM_QUICKSTART.md"
check_file "TEMPLATE_SYSTEM_DOCUMENTATION.md"
check_file "TEMPLATE_SYSTEM_INTEGRATION_GUIDE.md"
check_file "TEMPLATE_SYSTEM_ARCHITECTURE.md"
check_file "TEMPLATE_SYSTEM_COMPLETE.md"
echo ""

echo "════════════════════════════════════════"
echo "✅ Setup Summary"
echo "════════════════════════════════════════"
echo -e "Files Found:  ${GREEN}${FOUND}${NC}"
echo -e "Files Missing: ${RED}${MISSING}${NC}"
echo ""

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}🎉 All files created successfully!${NC}"
    echo ""
    echo "📖 Start with: TEMPLATE_SYSTEM_README.md"
    echo "⚡ Quick Setup: TEMPLATE_SYSTEM_QUICKSTART.md"
    echo "🔗 Integration: TEMPLATE_INTEGRATION_GUIDE.md"
    echo ""
    echo "To use in component:"
    echo "  import { AIChatWithTemplates } from '@/components/ai/ai-chat-with-templates';"
    echo "  export default () => <AIChatWithTemplates />;"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some files are missing!${NC}"
    echo "Please check the file paths above."
    exit 1
fi
