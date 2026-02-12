#!/usr/bin/env bash

# setup-deps.sh
# Installs system-level dependencies required for the MET4MORFOSES build pipeline.

set -euo pipefail

echo "🔍 Checking system dependencies..."

# Check for pdftotext (part of poppler)
if ! command -v pdftotext &> /dev/null; then
    echo "❌ pdftotext not found."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "💡 Detected macOS. Installing poppler via Homebrew..."
        brew install poppler
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "💡 Detected Linux. Installing poppler-utils via apt..."
        sudo apt-get update && sudo apt-get install -y poppler-utils
    else
        echo "⚠️  Please install 'poppler' (macOS) or 'poppler-utils' (Linux) manually."
        exit 1
    fi
else
    echo "✅ pdftotext is already installed."
fi

echo "✅ System dependencies are ready."
