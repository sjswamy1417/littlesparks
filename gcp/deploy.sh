#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# LittleSparks — Build & Deploy to GCP Cloud Run
#
# Usage:
#   chmod +x gcp/deploy.sh
#   ./gcp/deploy.sh
#
# Or deploy a specific tag:
#   IMAGE_TAG=v1.2.0 ./gcp/deploy.sh
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ──
PROJECT_ID="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID env var}"
REGION="${GCP_REGION:-asia-south1}"
REPO_NAME="littlesparks"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')}"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  LittleSparks — Deploy to Cloud Run                 ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Registry: $REGISTRY"
echo "Tag:      $IMAGE_TAG"
echo ""

# ── Build and push app image via Cloud Build ──
echo "→ Building app image via Cloud Build (remote)..."
gcloud builds submit \
  --project="$PROJECT_ID" \
  --tag="${REGISTRY}/app:${IMAGE_TAG}" \
  --timeout=1200s \
  --quiet \
  --gcs-log-dir="gs://${PROJECT_ID}_cloudbuild/logs" \
  --dockerfile=docker/Dockerfile \
  .

echo "→ Tagging app image as latest..."
gcloud artifacts docker tags add \
  "${REGISTRY}/app:${IMAGE_TAG}" \
  "${REGISTRY}/app:latest" \
  --quiet 2>&1 || true

# ── Build and push worker image via Cloud Build ──
echo "→ Building worker image via Cloud Build (remote)..."
gcloud builds submit \
  --project="$PROJECT_ID" \
  --tag="${REGISTRY}/worker:${IMAGE_TAG}" \
  --timeout=1200s \
  --quiet \
  --gcs-log-dir="gs://${PROJECT_ID}_cloudbuild/logs" \
  --dockerfile=docker/Dockerfile.worker \
  .

echo "→ Tagging worker image as latest..."
gcloud artifacts docker tags add \
  "${REGISTRY}/worker:${IMAGE_TAG}" \
  "${REGISTRY}/worker:latest" \
  --quiet 2>&1 || true

# ── Prepare service YAML with actual values ──
echo "→ Preparing Cloud Run service definition..."
sed \
  -e "s|PROJECT_ID|${PROJECT_ID}|g" \
  -e "s|REGION|${REGION}|g" \
  -e "s|:latest|:${IMAGE_TAG}|g" \
  gcp/service.yaml > /tmp/littlesparks-service.yaml

# ── Deploy to Cloud Run ──
echo "→ Deploying to Cloud Run..."
gcloud run services replace /tmp/littlesparks-service.yaml \
  --region="$REGION" \
  --quiet

# ── Allow unauthenticated access (public web app) ──
echo "→ Setting IAM policy for public access..."
gcloud run services add-iam-policy-binding littlesparks \
  --region="$REGION" \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --quiet

# ── Run database migrations ──
echo "→ Running database migrations..."
gcloud run jobs create littlesparks-migrate \
  --image="${REGISTRY}/app:${IMAGE_TAG}" \
  --region="$REGION" \
  --set-cloudsql-instances="${PROJECT_ID}:${REGION}:littlesparks-db" \
  --set-secrets="DATABASE_URL=littlesparks-database-url:latest" \
  --service-account="littlesparks-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --command="npx" \
  --args="prisma,migrate,deploy" \
  --max-retries=1 \
  --quiet 2>/dev/null || \
gcloud run jobs update littlesparks-migrate \
  --image="${REGISTRY}/app:${IMAGE_TAG}" \
  --region="$REGION" \
  --quiet

gcloud run jobs execute littlesparks-migrate \
  --region="$REGION" \
  --wait \
  --quiet

# ── Get service URL ──
SERVICE_URL=$(gcloud run services describe littlesparks \
  --region="$REGION" \
  --format="value(status.url)")

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Deployment Complete!                                ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "URL: $SERVICE_URL"
echo "Tag: $IMAGE_TAG"
echo ""
echo "Useful commands:"
echo "  gcloud run services describe littlesparks --region=$REGION"
echo "  gcloud run services logs read littlesparks --region=$REGION --limit=50"
echo "  gcloud sql connect littlesparks-db --user=littlesparks --database=littlesparks"
echo ""
