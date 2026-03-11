# =============================================================
# LittleSparks — Cloud SQL Auth Proxy for local dev
# =============================================================
# Run this in a separate terminal before `npm run dev`.
# Keeps running until you Ctrl+C.
#
# FIRST-TIME SETUP:
#   1. Install gcloud CLI: https://cloud.google.com/sdk/docs/install
#   2. Run: gcloud auth application-default login
#   3. Download cloud-sql-proxy.exe to this project root or PATH:
#      https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.1/cloud-sql-proxy.x64.windows.exe
#      Rename to: cloud-sql-proxy.exe
#   4. Create dev database (one-time, see CREATE DEV DB section below)

$PROJECT_ID = "project-0ddfb2d3-8c78-4896-9a8"
$REGION = "asia-south1"
$INSTANCE = "littlesparks-db"
$INSTANCE_CONNECTION = "${PROJECT_ID}:${REGION}:${INSTANCE}"

# Use port 5433 to avoid conflicts with any local postgres
$PORT = 5433

Write-Host "Starting Cloud SQL Auth Proxy..." -ForegroundColor Cyan
Write-Host "Instance : $INSTANCE_CONNECTION" -ForegroundColor Gray
Write-Host "Local    : localhost:$PORT" -ForegroundColor Gray
Write-Host "Database : littlesparks_dev (dev/test)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Leave this terminal open. Press Ctrl+C to stop." -ForegroundColor Green
Write-Host ""

# Try to find cloud-sql-proxy in project root or PATH
$proxyPath = ""
if (Test-Path ".\cloud-sql-proxy.exe") {
    $proxyPath = ".\cloud-sql-proxy.exe"
} elseif (Get-Command "cloud-sql-proxy" -ErrorAction SilentlyContinue) {
    $proxyPath = "cloud-sql-proxy"
} else {
    Write-Host "ERROR: cloud-sql-proxy.exe not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Download from:"
    Write-Host "  https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.1/cloud-sql-proxy.x64.windows.exe"
    Write-Host "  Rename to cloud-sql-proxy.exe and place in project root."
    exit 1
}

& $proxyPath "${INSTANCE_CONNECTION}" --port $PORT

# =============================================================
# ONE-TIME: CREATE DEV DATABASE
# Run these commands once after first proxy start:
#
#   $env:PGPASSWORD="YOUR_CLOUD_SQL_POSTGRES_PASSWORD"
#   psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE littlesparks_dev;"
#   psql -h localhost -p 5433 -U postgres -d littlesparks_dev -c "SELECT 1;"
#
# Then push the schema:
#   $env:DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5433/littlesparks_dev"
#   npx prisma db push
#   npx prisma db seed
# =============================================================
