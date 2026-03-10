# ──────────────────────────────────────────────────────────────────────
# LittleSparks — GCP One-Time Infrastructure Setup (PowerShell)
# Run this once to provision all GCP resources.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - A GCP project created with billing enabled
#
# Usage:
#   $env:GCP_PROJECT_ID = "your-project-id"
#   $env:DB_PASSWORD = "YourStrongPassword123!"
#   .\gcp\setup.ps1
# ──────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

# ── Configuration ──
$PROJECT_ID = $env:GCP_PROJECT_ID
$DB_PASSWORD = $env:DB_PASSWORD

if (-not $PROJECT_ID) { Write-Error "Set GCP_PROJECT_ID env var first: `$env:GCP_PROJECT_ID = 'your-project-id'"; exit 1 }
if (-not $DB_PASSWORD) { Write-Error "Set DB_PASSWORD env var first: `$env:DB_PASSWORD = 'YourPassword'"; exit 1 }

$REGION         = if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }
$DB_INSTANCE    = "littlesparks-db"
$DB_NAME        = "littlesparks"
$DB_USER        = "littlesparks"
$REPO_NAME      = "littlesparks"
$SERVICE_ACCOUNT = "littlesparks-sa"
$SA_EMAIL       = "$SERVICE_ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  LittleSparks - GCP Infrastructure Setup                       " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Project:  $PROJECT_ID"
Write-Host "  Region:   $REGION"
Write-Host ""

# ── Set project ──
gcloud config set project $PROJECT_ID

# ── Enable required APIs ──
Write-Host "-> Enabling GCP APIs..." -ForegroundColor Yellow
gcloud services enable `
  run.googleapis.com `
  sqladmin.googleapis.com `
  artifactregistry.googleapis.com `
  secretmanager.googleapis.com `
  cloudbuild.googleapis.com `
  compute.googleapis.com `
  --quiet

# ── Create Artifact Registry repository ──
Write-Host "-> Creating Artifact Registry repository..." -ForegroundColor Yellow
try {
    gcloud artifacts repositories create $REPO_NAME `
      --repository-format=docker `
      --location=$REGION `
      --description="LittleSparks container images" `
      --quiet 2>$null
} catch {
    Write-Host "   (repository already exists)" -ForegroundColor Gray
}

# ── Create Cloud SQL instance (db-f1-micro — cheapest) ──
Write-Host "-> Creating Cloud SQL PostgreSQL instance (db-f1-micro)..." -ForegroundColor Yellow
Write-Host "   This takes 5-10 minutes..." -ForegroundColor Gray

$sqlExists = gcloud sql instances list --format="value(name)" --filter="name=$DB_INSTANCE" 2>$null
if ($sqlExists -eq $DB_INSTANCE) {
    Write-Host "   (instance already exists)" -ForegroundColor Gray
} else {
    gcloud sql instances create $DB_INSTANCE `
      --database-version=POSTGRES_16 `
      --tier=db-f1-micro `
      --region=$REGION `
      --storage-size=10GB `
      --storage-type=HDD `
      --no-storage-auto-increase `
      --availability-type=zonal `
      --no-assign-ip `
      --network=default `
      --quiet
}

# ── Wait for instance to be ready ──
Write-Host "-> Waiting for Cloud SQL instance..." -ForegroundColor Yellow
$state = ""
$attempts = 0
while ($state -ne "RUNNABLE" -and $attempts -lt 60) {
    $state = gcloud sql instances describe $DB_INSTANCE --format="value(state)" 2>$null
    if ($state -ne "RUNNABLE") {
        Start-Sleep -Seconds 10
        $attempts++
        Write-Host "   Waiting... (state: $state, attempt $attempts/60)" -ForegroundColor Gray
    }
}
if ($state -ne "RUNNABLE") {
    Write-Error "Cloud SQL instance did not become ready in time"
    exit 1
}
Write-Host "   Cloud SQL is RUNNABLE" -ForegroundColor Green

# ── Create database and user ──
Write-Host "-> Creating database and user..." -ForegroundColor Yellow
try {
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE --quiet 2>$null
} catch {
    Write-Host "   (database already exists)" -ForegroundColor Gray
}

try {
    gcloud sql users create $DB_USER `
      --instance=$DB_INSTANCE `
      --password=$DB_PASSWORD `
      --quiet 2>$null
} catch {
    Write-Host "   (user already exists)" -ForegroundColor Gray
}

# ── Create service account for Cloud Run ──
Write-Host "-> Creating service account..." -ForegroundColor Yellow
try {
    gcloud iam service-accounts create $SERVICE_ACCOUNT `
      --display-name="LittleSparks Cloud Run SA" `
      --quiet 2>$null
} catch {
    Write-Host "   (service account already exists)" -ForegroundColor Gray
}

# ── Grant necessary roles ──
Write-Host "-> Granting IAM roles..." -ForegroundColor Yellow
$roles = @(
    "roles/cloudsql.client",
    "roles/secretmanager.secretAccessor",
    "roles/logging.logWriter",
    "roles/monitoring.metricWriter"
)

foreach ($role in $roles) {
    gcloud projects add-iam-policy-binding $PROJECT_ID `
      --member="serviceAccount:$SA_EMAIL" `
      --role=$role `
      --quiet --no-user-output-enabled 2>$null
    Write-Host "   Granted $role" -ForegroundColor Gray
}

# ── Create secrets in Secret Manager ──
Write-Host "-> Creating secrets..." -ForegroundColor Yellow

$CLOUD_SQL_CONNECTION = "${PROJECT_ID}:${REGION}:${DB_INSTANCE}"
$DATABASE_URL = "postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_CONNECTION}"

# Generate NEXTAUTH_SECRET
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$NEXTAUTH_SECRET = [Convert]::ToBase64String($bytes)

function New-GcpSecret {
    param (
        [string]$Name,
        [string]$Value
    )
    $tempFile = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($tempFile, $Value)

        # Try creating the secret first
        $createResult = gcloud secrets create $Name `
          --data-file=$tempFile `
          --replication-policy=user-managed `
          --locations=$REGION `
          --quiet 2>&1

        if ($LASTEXITCODE -ne 0) {
            # Secret exists, add a new version
            gcloud secrets versions add $Name `
              --data-file=$tempFile `
              --quiet 2>$null
            Write-Host "   Updated secret: $Name" -ForegroundColor Gray
        } else {
            Write-Host "   Created secret: $Name" -ForegroundColor Gray
        }
    } finally {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

$RESEND_KEY = if ($env:RESEND_API_KEY) { $env:RESEND_API_KEY } else { "re_placeholder_update_later" }

New-GcpSecret -Name "littlesparks-database-url" -Value $DATABASE_URL
New-GcpSecret -Name "littlesparks-nextauth-secret" -Value $NEXTAUTH_SECRET
New-GcpSecret -Name "littlesparks-nextauth-url" -Value "https://littlesparks-${PROJECT_ID}.${REGION}.run.app"
New-GcpSecret -Name "littlesparks-resend-api-key" -Value $RESEND_KEY

# ── Done ──
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Setup Complete!                                                " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Cloud SQL instance:    $DB_INSTANCE"
Write-Host "  Cloud SQL connection:  $CLOUD_SQL_CONNECTION"
Write-Host "  Artifact Registry:     ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"
Write-Host "  Service Account:       $SA_EMAIL"
Write-Host "  NEXTAUTH_SECRET:       (stored in Secret Manager)"
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Yellow
Write-Host "    1. Update RESEND_API_KEY secret if you have one:"
Write-Host "       echo 're_xxx' | gcloud secrets versions add littlesparks-resend-api-key --data-file=-"
Write-Host "    2. Run: .\gcp\deploy.ps1"
Write-Host ""
