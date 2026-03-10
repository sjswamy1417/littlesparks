# ──────────────────────────────────────────────────────────────────────
# LittleSparks — Run database seed on Cloud Run (PowerShell)
#
# Usage:
#   $env:GCP_PROJECT_ID = "your-project-id"
#   .\gcp\seed.ps1
# ──────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

$PROJECT_ID = $env:GCP_PROJECT_ID
if (-not $PROJECT_ID) { Write-Error "Set GCP_PROJECT_ID env var first"; exit 1 }

$REGION    = if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }
$REGISTRY  = "${REGION}-docker.pkg.dev/${PROJECT_ID}/littlesparks"
$IMAGE_TAG = if ($env:IMAGE_TAG) { $env:IMAGE_TAG } else { "latest" }

Write-Host "-> Running database seed..." -ForegroundColor Yellow

$jobExists = gcloud run jobs list --region=$REGION --format="value(metadata.name)" --filter="metadata.name=littlesparks-seed" 2>$null
if ($jobExists -eq "littlesparks-seed") {
    gcloud run jobs update littlesparks-seed `
      --image="${REGISTRY}/app:${IMAGE_TAG}" `
      --region=$REGION `
      --quiet
} else {
    gcloud run jobs create littlesparks-seed `
      --image="${REGISTRY}/app:${IMAGE_TAG}" `
      --region=$REGION `
      --set-cloudsql-instances="${PROJECT_ID}:${REGION}:littlesparks-db" `
      --set-secrets="DATABASE_URL=littlesparks-database-url:latest" `
      --service-account="littlesparks-sa@${PROJECT_ID}.iam.gserviceaccount.com" `
      --command="npx" `
      --args="prisma,db,seed" `
      --max-retries=0 `
      --quiet
}

gcloud run jobs execute littlesparks-seed `
  --region=$REGION `
  --wait `
  --quiet

Write-Host "-> Seed complete!" -ForegroundColor Green
