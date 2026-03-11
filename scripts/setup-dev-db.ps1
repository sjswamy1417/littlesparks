# =============================================================
# LittleSparks — One-time dev database setup
# =============================================================
# Run ONCE after start-proxy.ps1 is running in another terminal.
# Creates littlesparks_dev DB, pushes schema, seeds test data.

param(
    [Parameter(Mandatory=$true)]
    [string]$DbPassword
)

$PORT = 5433
$HOST = "localhost"
$USER = "postgres"
$DEV_DB = "littlesparks_dev"

$env:PGPASSWORD = $DbPassword
$env:DATABASE_URL = "postgresql://${USER}:${DbPassword}@${HOST}:${PORT}/${DEV_DB}"

Write-Host "=== Step 1: Create dev database ===" -ForegroundColor Cyan
$result = psql -h $HOST -p $PORT -U $USER -c "SELECT 1 FROM pg_database WHERE datname='$DEV_DB';" 2>&1
if ($result -match "1 row") {
    Write-Host "Database '$DEV_DB' already exists, skipping create." -ForegroundColor Yellow
} else {
    psql -h $HOST -p $PORT -U $USER -c "CREATE DATABASE $DEV_DB;"
    Write-Host "Created database '$DEV_DB'." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Step 2: Push Prisma schema ===" -ForegroundColor Cyan
npx prisma db push

Write-Host ""
Write-Host "=== Step 3: Seed test data ===" -ForegroundColor Cyan
npx prisma db seed

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "Your .env.local DATABASE_URL should be:" -ForegroundColor Gray
Write-Host "  postgresql://${USER}:****@${HOST}:${PORT}/${DEV_DB}" -ForegroundColor White
