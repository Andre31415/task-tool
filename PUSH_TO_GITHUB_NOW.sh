#!/bin/bash

# Push to GitHub Script
# This script will help you push your code to GitHub

echo "🚀 Pushing Task Manager to GitHub..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the Task Tool directory"
    echo "Please run: cd '/Users/andrefarinazojr/Task Tool'"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git not initialized"
    echo "Run: git init"
    exit 1
fi

echo "📋 Current status:"
git status --short
echo ""

echo "🔗 Remote repository:"
git remote -v
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Pushing to GitHub..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "When prompted, enter:"
echo "  Username: Andre31415"
echo "  Password: YOUR_PERSONAL_ACCESS_TOKEN"
echo ""
echo "Don't have a token? Get one here:"
echo "  https://github.com/settings/tokens"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Attempt to push
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS! Code pushed to GitHub"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 Your repository:"
    echo "   https://github.com/Andre31415/task-tool"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Visit: https://vercel.com/new"
    echo "   2. Import: Andre31415/task-tool"
    echo "   3. Add environment variables"
    echo "   4. Deploy!"
    echo ""
    echo "📚 See: VERCEL_QUICK_DEPLOY.md for details"
    echo ""
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ Push failed"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔧 Common solutions:"
    echo ""
    echo "1. Use Personal Access Token (not password)"
    echo "   Get one: https://github.com/settings/tokens"
    echo ""
    echo "2. Try SSH instead:"
    echo "   git remote set-url origin git@github.com:Andre31415/task-tool.git"
    echo "   git push -u origin main"
    echo ""
    echo "3. Check credentials:"
    echo "   git config --global user.name 'Andre31415'"
    echo "   git config --global user.email 'your-email@example.com'"
    echo ""
fi

