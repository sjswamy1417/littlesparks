#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# LittleSparks — Run database seed on Cloud Run
# Seeds the database with Vedic Maths courses, badges, and test accounts.
#
# Usage:
#   chmod +x gcp/seed.sh
#   ./gcp/seed.sh
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID env var}"
REGION="${GCP_REGION:-asia-south1}"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/littlesparks"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "→ Running database seed..."

gcloud run jobs create littlesparks-seed \
  --image="${REGISTRY}/app:${IMAGE_TAG}" \
  --region="$REGION" \
  --set-cloudsql-instances="${PROJECT_ID}:${REGION}:littlesparks-db" \
  --set-secrets="DATABASE_URL=littlesparks-database-url:latest" \
  --service-account="littlesparks-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --command="npx" \
  --args="prisma,db,seed" \
  --max-retries=0 \
  --quiet 2>/dev/null || \
gcloud run jobs update littlesparks-seed \
  --image="${REGISTRY}/app:${IMAGE_TAG}" \
  --region="$REGION" \
  --quiet

gcloud run jobs execute littlesparks-seed \
  --region="$REGION" \
  --wait \
  --quiet

echo "→ Seed complete!"
