#!/bin/bash

# Exit on error
set -e

# Change to the project directory
cd ~/projects/khudroshop

echo "📁 Now in $(pwd)"

# Pull the latest changes
echo "🔄 Pulling the latest changes..."
git pull

# Install dependencies
echo "📦 Installing dependencies..."
# pnpm install

# Migrate database
echo "📦 Migrating database..."
# pnpm run migrate

# Build the project
echo "🏗️ Building the project..."
npm run build-only

echo "🔁 Restarting PM2 process..."
pm2 restart 0

echo "✅ Deployment complete."
