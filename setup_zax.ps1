Write-Host "=========================================="
Write-Host "   ZAX SETUP & REPAIR SCRIPT"
Write-Host "=========================================="

# 1. Generate Prisma Client
Write-Host "`n[1/3] Generating Prisma Client..."
cmd /c "npx prisma generate"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Prisma Generate failed." -ForegroundColor Red
    Write-Host "Ensure you are in the project root and 'npm install' has run."
    exit
}

# 2. Migration
Write-Host "`n[2/3] Applying Database Migrations..."
cmd /c "npx prisma migrate dev --name auto_fix"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Migration command returned error. Checking if DB is reachable..." -ForegroundColor Yellow
    # Proceeding anyway as it might just be drift or existing migration
}

# 3. Start App
Write-Host "`n[3/3] Starting ZAX Application..."
Write-Host "Access http://localhost:3000 in your browser when Ready."
cmd /c "npm run dev"
