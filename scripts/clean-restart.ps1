#!/usr/bin/env pwsh
# Clean Next.js Build Cache and Restart Dev Server
# Use this script when you encounter build cache errors

Write-Host "🧹 Cleaning Next.js build cache..." -ForegroundColor Cyan

# Kill all Node.js processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe 2>$null
    Write-Host "✓ Node.js processes stopped" -ForegroundColor Green
} catch {
    Write-Host "No Node.js processes to stop" -ForegroundColor Gray
}

# Wait a moment
Start-Sleep -Seconds 2

# Remove .next directory
Write-Host "Removing .next directory..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ .next directory removed" -ForegroundColor Green
} else {
    Write-Host ".next directory doesn't exist" -ForegroundColor Gray
}

# Wait a moment
Start-Sleep -Seconds 1

# Start dev server
Write-Host ""
Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
Write-Host ""
npm run dev
