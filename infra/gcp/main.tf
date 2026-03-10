# ============================================================================
# LittleSparks — GCP Infrastructure (Terraform)
# Cloud Run + Cloud SQL + Memorystore + Artifact Registry
# ============================================================================

terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure for remote state
  # backend "gcs" {
  #   bucket = "littlesparks-tf-state"
  #   prefix = "terraform/state"
  # }
}

# ----------------------------------------------------------------------------
# Variables
# ----------------------------------------------------------------------------

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for all resources"
  type        = string
  default     = "asia-south1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro" # Use db-custom-2-4096 for production
}

variable "redis_memory_size_gb" {
  description = "Memorystore Redis memory in GB"
  type        = number
  default     = 1
}

variable "app_image" {
  description = "Docker image for the Next.js app (full path in Artifact Registry)"
  type        = string
  default     = ""
}

variable "worker_image" {
  description = "Docker image for the BullMQ worker"
  type        = string
  default     = ""
}

variable "domain" {
  description = "Custom domain for the app (optional)"
  type        = string
  default     = ""
}

# ----------------------------------------------------------------------------
# Provider
# ----------------------------------------------------------------------------

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ----------------------------------------------------------------------------
# Enable required APIs
# ----------------------------------------------------------------------------

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "vpcaccess.googleapis.com",
    "compute.googleapis.com",
    "servicenetworking.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

# ----------------------------------------------------------------------------
# VPC for private connectivity
# ----------------------------------------------------------------------------

resource "google_compute_network" "vpc" {
  name                    = "littlesparks-vpc"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.apis]
}

resource "google_compute_subnetwork" "subnet" {
  name          = "littlesparks-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Private services access for Cloud SQL
resource "google_compute_global_address" "private_ip_range" {
  name          = "littlesparks-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]
}

# VPC Connector for Cloud Run → private services
resource "google_vpc_access_connector" "connector" {
  name          = "littlesparks-connector"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.8.0.0/28"
  min_instances = 2
  max_instances = 3
  depends_on    = [google_project_service.apis]
}

# ----------------------------------------------------------------------------
# Artifact Registry
# ----------------------------------------------------------------------------

resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "littlesparks"
  format        = "DOCKER"
  description   = "LittleSparks container images"
  depends_on    = [google_project_service.apis]
}

# ----------------------------------------------------------------------------
# Cloud SQL — PostgreSQL 16
# ----------------------------------------------------------------------------

resource "google_sql_database_instance" "postgres" {
  name             = "littlesparks-db-${var.environment}"
  database_version = "POSTGRES_16"
  region           = var.region

  depends_on = [google_service_networking_connection.private_vpc]

  settings {
    tier              = var.db_tier
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_size         = 10
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc.id
      enable_private_path_for_google_cloud_services = true
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = var.environment == "prod"
      backup_retention_settings {
        retained_backups = 7
      }
    }

    maintenance_window {
      day          = 7 # Sunday
      hour         = 4
      update_track = "stable"
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }

    insights_config {
      query_insights_enabled  = true
      record_application_tags = true
    }
  }

  deletion_protection = var.environment == "prod"
}

resource "google_sql_database" "littlesparks" {
  name     = "littlesparks"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "app_user" {
  name     = "littlesparks"
  instance = google_sql_database_instance.postgres.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

# ----------------------------------------------------------------------------
# Memorystore — Redis 7
# ----------------------------------------------------------------------------

resource "google_redis_instance" "redis" {
  name               = "littlesparks-redis-${var.environment}"
  tier               = var.environment == "prod" ? "STANDARD_HA" : "BASIC"
  memory_size_gb     = var.redis_memory_size_gb
  region             = var.region
  redis_version      = "REDIS_7_0"
  authorized_network = google_compute_network.vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"

  redis_configs = {
    maxmemory-policy = "allkeys-lru"
  }

  depends_on = [google_project_service.apis, google_service_networking_connection.private_vpc]
}

# ----------------------------------------------------------------------------
# Secret Manager
# ----------------------------------------------------------------------------

resource "google_secret_manager_secret" "nextauth_secret" {
  secret_id = "littlesparks-nextauth-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "nextauth_secret_value" {
  secret      = google_secret_manager_secret.nextauth_secret.id
  secret_data = random_password.nextauth_secret.result
}

resource "random_password" "nextauth_secret" {
  length  = 44
  special = false
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "littlesparks-db-password"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_password_value" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

resource "google_secret_manager_secret" "resend_api_key" {
  secret_id = "littlesparks-resend-api-key"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

# ----------------------------------------------------------------------------
# Service Account for Cloud Run
# ----------------------------------------------------------------------------

resource "google_service_account" "cloud_run_sa" {
  account_id   = "littlesparks-run"
  display_name = "LittleSparks Cloud Run Service Account"
}

resource "google_project_iam_member" "cloud_run_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

resource "google_project_iam_member" "cloud_run_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ----------------------------------------------------------------------------
# Cloud Run — Next.js App
# ----------------------------------------------------------------------------

locals {
  app_image    = var.app_image != "" ? var.app_image : "${var.region}-docker.pkg.dev/${var.project_id}/littlesparks/app:latest"
  worker_image = var.worker_image != "" ? var.worker_image : "${var.region}-docker.pkg.dev/${var.project_id}/littlesparks/worker:latest"
  database_url = "postgresql://${google_sql_user.app_user.name}:${random_password.db_password.result}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.littlesparks.name}"
  redis_url    = "redis://${google_redis_instance.redis.host}:${google_redis_instance.redis.port}"
}

resource "google_cloud_run_v2_service" "app" {
  name     = "littlesparks-app"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = var.environment == "prod" ? 1 : 0
      max_instance_count = 10
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = local.app_image

      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
        cpu_idle          = var.environment != "prod"
        startup_cpu_boost = true
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "DATABASE_URL"
        value = local.database_url
      }
      env {
        name  = "REDIS_URL"
        value = local.redis_url
      }
      env {
        name  = "NEXT_PUBLIC_APP_URL"
        value = var.domain != "" ? "https://${var.domain}" : "https://littlesparks-app-${data.google_project.current.number}.${var.region}.run.app"
      }
      env {
        name  = "NEXT_PUBLIC_APP_NAME"
        value = "LittleSparks"
      }
      env {
        name  = "NEXT_PUBLIC_ENABLE_LEADERBOARD"
        value = "true"
      }
      env {
        name  = "NEXT_PUBLIC_ENABLE_PARENT_PORTAL"
        value = "true"
      }
      env {
        name = "NEXTAUTH_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.nextauth_secret.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "NEXTAUTH_URL"
        value = var.domain != "" ? "https://${var.domain}" : ""
      }

      startup_probe {
        http_get {
          path = "/api/health"
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/api/health"
        }
        period_seconds = 30
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_project_service.apis,
    google_secret_manager_secret_version.nextauth_secret_value,
  ]
}

# Allow unauthenticated access (public web app)
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.app.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ----------------------------------------------------------------------------
# Cloud Run — BullMQ Worker
# ----------------------------------------------------------------------------

resource "google_cloud_run_v2_service" "worker" {
  name     = "littlesparks-worker"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = 1
      max_instance_count = 3
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = local.worker_image

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "DATABASE_URL"
        value = local.database_url
      }
      env {
        name  = "REDIS_URL"
        value = local.redis_url
      }
      env {
        name = "RESEND_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.resend_api_key.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [google_project_service.apis]
}

# ----------------------------------------------------------------------------
# Data sources
# ----------------------------------------------------------------------------

data "google_project" "current" {}

# ----------------------------------------------------------------------------
# Outputs
# ----------------------------------------------------------------------------

output "app_url" {
  description = "Cloud Run app URL"
  value       = google_cloud_run_v2_service.app.uri
}

output "worker_url" {
  description = "Cloud Run worker URL (internal)"
  value       = google_cloud_run_v2_service.worker.uri
}

output "artifact_registry" {
  description = "Artifact Registry repository path"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/littlesparks"
}

output "database_instance" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.postgres.name
}

output "database_private_ip" {
  description = "Cloud SQL private IP"
  value       = google_sql_database_instance.postgres.private_ip_address
  sensitive   = true
}

output "redis_host" {
  description = "Memorystore Redis host"
  value       = google_redis_instance.redis.host
  sensitive   = true
}

output "redis_port" {
  description = "Memorystore Redis port"
  value       = google_redis_instance.redis.port
}

output "service_account_email" {
  description = "Cloud Run service account"
  value       = google_service_account.cloud_run_sa.email
}
