# ──────────────────────────────────────────────────────────────────────
# LittleSparks — Build & Deploy to GCP Cloud Run (PowerShell)
#
# Usage:
#   $env:GCP_PROJECT_ID = "your-project-id"
#   .\gcp\deploy.ps1
#
# Or deploy a specific tag:
#   $env:IMAGE_TAG = "v1.2.0"
#   .\gcp\deploy.ps1
# ──────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

# ── Configuration ──
$PROJECT_ID = $env:GCP_PROJECT_ID
if (-not $PROJECT_ID) { Write-Error "Set GCP_PROJECT_ID env var first"; exit 1 }

$REGION    = if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }
$REPO_NAME = "littlesparks"
$REGISTRY  = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"

# Get image tag from git or env
if ($env:IMAGE_TAG) {
    $IMAGE_TAG = $env:IMAGE_TAG
} else {
    try { $IMAGE_TAG = git rev-parse --short HEAD 2>$null } catch { $IMAGE_TAG = "latest" }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  LittleSparks - Deploy to Cloud Run                            " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Registry: $REGISTRY"
Write-Host "  Tag:      $IMAGE_TAG"
Write-Host ""

# ── Build and push app image via Cloud Build (remote) ──
Write-Host "-> Building app image via Cloud Build (remote)..." -ForegroundColor Yellow
gcloud builds submit `
  --project=$PROJECT_ID `
  --tag="${REGISTRY}/app:${IMAGE_TAG}" `
  --timeout=1200s `
  --quiet `
  --gcs-log-dir="gs://${PROJECT_ID}_cloudbuild/logs" `
  --dockerfile=docker/Dockerfile `
  .

Write-Host "-> Tagging app image as latest..." -ForegroundColor Yellow
gcloud artifacts docker tags add `
  "${REGISTRY}/app:${IMAGE_TAG}" `
  "${REGISTRY}/app:latest" `
  --quiet 2>$null

# ── Build and push worker image via Cloud Build (remote) ──
Write-Host "-> Building worker image via Cloud Build (remote)..." -ForegroundColor Yellow
gcloud builds submit `
  --project=$PROJECT_ID `
  --tag="${REGISTRY}/worker:${IMAGE_TAG}" `
  --timeout=1200s `
  --quiet `
  --gcs-log-dir="gs://${PROJECT_ID}_cloudbuild/logs" `
  --dockerfile=docker/Dockerfile.worker `
  .

Write-Host "-> Tagging worker image as latest..." -ForegroundColor Yellow
gcloud artifacts docker tags add `
  "${REGISTRY}/worker:${IMAGE_TAG}" `
  "${REGISTRY}/worker:latest" `
  --quiet 2>$null

# ── Prepare service YAML with actual values ──
Write-Host "-> Preparing Cloud Run service definition..." -ForegroundColor Yellow
$serviceYaml = Get-Content "gcp/service.yaml" -Raw
$serviceYaml = $serviceYaml -replace "PROJECT_ID", $PROJECT_ID
$serviceYaml = $serviceYaml -replace "REGION", $REGION
$serviceYaml = $serviceYaml -replace ":latest", ":${IMAGE_TAG}"
$tempServiceFile = Join-Path $env:TEMP "littlesparks-service.yaml"
$serviceYaml | Out-File -FilePath $tempServiceFile -Encoding utf8

# ── Deploy to Cloud Run ──
Write-Host "-> Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run services replace $tempServiceFile `
  --region=$REGION `
  --quiet

# ── Allow unauthenticated access (public web app) ──
Write-Host "-> Setting IAM policy for public access..." -ForegroundColor Yellow
gcloud run services add-iam-policy-binding littlesparks `
  --region=$REGION `
  --member="allUsers" `
  --role="roles/run.invoker" `
  --quiet

# ── Run database migrations ──
Write-Host "-> Running database migrations..." -ForegroundColor Yellow

$jobExists = gcloud run jobs list --region=$REGION --format="value(metadata.name)" --filter="metadata.name=littlesparks-migrate" 2>$null
if ($jobExists -eq "littlesparks-migrate") {
    gcloud run jobs update littlesparks-migrate `
      --image="${REGISTRY}/app:${IMAGE_TAG}" `
      --region=$REGION `
      --quiet
} else {
    gcloud run jobs create littlesparks-migrate `
      --image="${REGISTRY}/app:${IMAGE_TAG}" `
      --region=$REGION `
      --set-cloudsql-instances="${PROJECT_ID}:${REGION}:littlesparks-db" `
      --set-secrets="DATABASE_URL=littlesparks-database-url:latest" `
      --service-account="littlesparks-sa@${PROJECT_ID}.iam.gserviceaccount.com" `
      --command="npx" `
      --args="prisma,migrate,deploy" `
      --max-retries=1 `
      --quiet
}

gcloud run jobs execute littlesparks-migrate `
  --region=$REGION `
  --wait `
  --quiet

# ── Get service URL ──
$SERVICE_URL = gcloud run services describe littlesparks `
  --region=$REGION `
  --format="value(status.url)"

# ── Clean up temp file ──
Remove-Item $tempServiceFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Deployment Complete!                                           " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  URL: $SERVICE_URL" -ForegroundColor Cyan
Write-Host "  Tag: $IMAGE_TAG"
Write-Host ""
Write-Host "  Useful commands:" -ForegroundColor Yellow
Write-Host "    gcloud run services describe littlesparks --region=$REGION"
Write-Host "    gcloud run services logs read littlesparks --region=$REGION --limit=50"
Write-Host "    gcloud sql connect littlesparks-db --user=littlesparks --database=littlesparks"
Write-Host ""
