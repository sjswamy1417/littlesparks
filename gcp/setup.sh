#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# LittleSparks — GCP One-Time Infrastructure Setup
# Run this once to provision all GCP resources.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - A GCP project created with billing enabled
#
# Usage:
#   chmod +x gcp/setup.sh
#   ./gcp/setup.sh
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration (edit these) ──
PROJECT_ID="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID env var}"
REGION="${GCP_REGION:-asia-south1}"
DB_INSTANCE="littlesparks-db"
DB_NAME="littlesparks"
DB_USER="littlesparks"
DB_PASSWORD="${DB_PASSWORD:?Set DB_PASSWORD env var}"
REPO_NAME="littlesparks"
SERVICE_ACCOUNT="littlesparks-sa"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  LittleSparks — GCP Infrastructure Setup            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Project:  $PROJECT_ID"
echo "Region:   $REGION"
echo ""

# ── Set project ──
gcloud config set project "$PROJECT_ID"

# ── Enable required APIs ──
echo "→ Enabling GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  compute.googleapis.com \
  --quiet

# ── Create Artifact Registry repository ──
echo "→ Creating Artifact Registry repository..."
gcloud artifacts repositories create "$REPO_NAME" \
  --repository-format=docker \
  --location="$REGION" \
  --description="LittleSparks container images" \
  --quiet 2>&1 || echo "  (repository already exists)"

# ── Create Cloud SQL instance (db-f1-micro — cheapest) ──
echo "→ Creating Cloud SQL PostgreSQL instance (db-f1-micro)..."
echo "  This takes 5-10 minutes..."
if gcloud sql instances describe "$DB_INSTANCE" --format="value(state)" 2>/dev/null; then
  echo "  (instance already exists)"
else
  gcloud sql instances create "$DB_INSTANCE" \
    --database-version=POSTGRES_16 \
    --edition=enterprise \
    --tier=db-f1-micro \
    --region="$REGION" \
    --storage-size=10GB \
    --storage-type=HDD \
    --no-storage-auto-increase \
    --availability-type=zonal \
    --assign-ip \
    --quiet
fi

# Wait for instance to be ready
echo "→ Waiting for Cloud SQL instance..."
STATE=""
ATTEMPTS=0
while [ "$STATE" != "RUNNABLE" ] && [ $ATTEMPTS -lt 60 ]; do
  STATE=$(gcloud sql instances describe "$DB_INSTANCE" --format="value(state)" 2>/dev/null || echo "PENDING")
  if [ "$STATE" != "RUNNABLE" ]; then
    echo "  Waiting... (state: $STATE, attempt $((ATTEMPTS+1))/60)"
    sleep 10
    ATTEMPTS=$((ATTEMPTS+1))
  fi
done
if [ "$STATE" != "RUNNABLE" ]; then
  echo "ERROR: Cloud SQL instance did not become ready"
  exit 1
fi
echo "  Cloud SQL is RUNNABLE"

# ── Create database and user ──
echo "→ Creating database and user..."
gcloud sql databases create "$DB_NAME" \
  --instance="$DB_INSTANCE" \
  --quiet 2>&1 || echo "  (database already exists)"

gcloud sql users create "$DB_USER" \
  --instance="$DB_INSTANCE" \
  --password="$DB_PASSWORD" \
  --quiet 2>&1 || echo "  (user already exists)"

# ── Create service account for Cloud Run ──
echo "→ Creating service account..."
gcloud iam service-accounts create "$SERVICE_ACCOUNT" \
  --display-name="LittleSparks Cloud Run SA" \
  --quiet 2>&1 || echo "  (service account already exists)"

SA_EMAIL="${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant necessary roles
echo "→ Granting IAM roles..."
for ROLE in \
  roles/cloudsql.client \
  roles/secretmanager.secretAccessor \
  roles/logging.logWriter \
  roles/monitoring.metricWriter; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --quiet --no-user-output-enabled
done

# ── Create secrets in Secret Manager ──
echo "→ Creating secrets..."
CLOUD_SQL_CONNECTION="${PROJECT_ID}:${REGION}:${DB_INSTANCE}"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_CONNECTION}"
NEXTAUTH_SECRET=$(python -c "import secrets,base64; print(base64.b64encode(secrets.token_bytes(32)).decode())")

create_secret() {
  local name="$1"
  local value="$2"
  local tmpfile
  tmpfile=$(mktemp)
  echo "$value" > "$tmpfile"
  if gcloud secrets describe "$name" --quiet 2>/dev/null; then
    gcloud secrets versions add "$name" \
      --data-file="$tmpfile" \
      --quiet
    echo "  Updated secret: $name"
  else
    gcloud secrets create "$name" \
      --data-file="$tmpfile" \
      --replication-policy=user-managed \
      --locations="$REGION" \
      --quiet
    echo "  Created secret: $name"
  fi
  rm -f "$tmpfile"
}

create_secret "littlesparks-database-url" "$DATABASE_URL"
create_secret "littlesparks-nextauth-secret" "$NEXTAUTH_SECRET"
create_secret "littlesparks-nextauth-url" "https://littlesparks-${PROJECT_ID}.${REGION}.run.app"
create_secret "littlesparks-resend-api-key" "${RESEND_API_KEY:-re_placeholder_update_later}"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Setup Complete!                                     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Cloud SQL instance:    $DB_INSTANCE"
echo "Cloud SQL connection:  $CLOUD_SQL_CONNECTION"
echo "Artifact Registry:     ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}"
echo "Service Account:       $SA_EMAIL"
echo "NEXTAUTH_SECRET:       (stored in Secret Manager)"
echo ""
echo "Next steps:"
echo "  1. Update RESEND_API_KEY secret if you have one:"
echo "     echo 're_xxx' | gcloud secrets versions add littlesparks-resend-api-key --data-file=-"
echo "  2. Run: ./gcp/deploy.sh"
echo ""
