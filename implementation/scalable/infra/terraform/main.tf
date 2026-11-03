# Tola · scalable track · GCP asia-south1 (Mumbai) skeleton
# One state per environment: `terraform -chdir=infra/terraform init -backend-config=env/<env>.backend.hcl`
#                            `terraform plan -var-file=env/<env>.tfvars`
# Docs: implementation/scalable/docs/INFRASTRUCTURE.md
#
# Data residency: every regional resource is pinned to asia-south1; backups and
# GCS buckets are also in asia-south1 (no multi-region "ASIA" buckets).

terraform {
  required_version = ">= 1.9"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 8.7"
    }
  }
  backend "gcs" {
    # bucket/prefix supplied via -backend-config (env/<env>.backend.hcl)
  }
}

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------
variable "project_id" { type = string }
variable "env" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env must be dev, staging or prod."
  }
}
variable "region" {
  type    = string
  default = "asia-south1"
}
variable "artifact_project_id" {
  type        = string
  description = "Shared project that hosts Artifact Registry (images are built once, deployed everywhere)."
}
variable "github_repo" {
  type        = string
  description = "owner/repo allowed to deploy through Workload Identity Federation."
}
variable "image_tag" {
  type    = string
  default = "bootstrap" # CI deploys real tags; Terraform ignores image drift (see lifecycle blocks)
}
variable "db_tier" {
  type    = string
  default = "db-custom-1-3840" # prod at 10k karigars: db-custom-2-7680 (see COST.md)
}
variable "db_ha" {
  type    = bool
  default = false # true in prod
}
variable "redis_memory_gb" {
  type    = number
  default = 1
}
variable "api_min_instances" {
  type    = number
  default = 0 # prod: 1 (avoid cold start on karigar confirm)
}
variable "api_max_instances" {
  type    = number
  default = 10
}
variable "alert_email" { type = string }

locals {
  name   = "tola-${var.env}"
  labels = { app = "tola", env = var.env, managed_by = "terraform" }
  image  = "${var.region}-docker.pkg.dev/${var.artifact_project_id}/tola"
  is_prod = var.env == "prod"

  # Secret names (values are added out-of-band with `gcloud secrets versions add`)
  secrets = [
    "tola-database-url", "tola-redis-url", "tola-server-signing-key",
    "lyzr-api-key", "sarvam-api-key", "otp-provider-key",
    "whatsapp-token", "ivr-provider-key", "psp-key-id", "psp-key-secret",
  ]
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# -----------------------------------------------------------------------------
# APIs
# -----------------------------------------------------------------------------
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com", "sqladmin.googleapis.com", "redis.googleapis.com",
    "secretmanager.googleapis.com", "cloudtasks.googleapis.com", "cloudscheduler.googleapis.com",
    "vpcaccess.googleapis.com", "servicenetworking.googleapis.com", "compute.googleapis.com",
    "iamcredentials.googleapis.com", "sts.googleapis.com", "monitoring.googleapis.com",
    "logging.googleapis.com", "cloudtrace.googleapis.com", "cloudkms.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

# -----------------------------------------------------------------------------
# Network: private VPC; Cloud SQL + Memorystore on private IPs only
# -----------------------------------------------------------------------------
resource "google_compute_network" "vpc" {
  name                    = "${local.name}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "run" {
  name                     = "${local.name}-run"
  region                   = var.region
  network                  = google_compute_network.vpc.id
  ip_cidr_range            = "10.10.0.0/24" # Cloud Run Direct VPC egress
  private_ip_google_access = true
}

resource "google_compute_global_address" "psa" {
  name          = "${local.name}-psa"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 20
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "psa" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.psa.name]
}

# Static egress IP for PSP / WhatsApp / IVR allow-lists
resource "google_compute_router" "r" {
  name    = "${local.name}-router"
  region  = var.region
  network = google_compute_network.vpc.id
}
resource "google_compute_address" "egress" {
  name   = "${local.name}-egress"
  region = var.region
}
resource "google_compute_router_nat" "nat" {
  name                               = "${local.name}-nat"
  router                             = google_compute_router.r.name
  region                             = var.region
  nat_ip_allocate_option             = "MANUAL_ONLY"
  nat_ips                            = [google_compute_address.egress.self_link]
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# -----------------------------------------------------------------------------
# KMS (CMEK for Cloud SQL + GCS); 90-day rotation
# -----------------------------------------------------------------------------
resource "google_kms_key_ring" "kr" {
  name     = "${local.name}-kr"
  location = var.region
}
resource "google_kms_crypto_key" "data" {
  name            = "data"
  key_ring        = google_kms_key_ring.kr.id
  rotation_period = "7776000s"
  lifecycle { prevent_destroy = true }
}
# NOTE: grant the Cloud SQL and GCS service agents roles/cloudkms.cryptoKeyEncrypterDecrypter on this key
# (google_project_service_identity + google_kms_crypto_key_iam_member), omitted in the skeleton.

# -----------------------------------------------------------------------------
# Cloud SQL · PostgreSQL 16
# -----------------------------------------------------------------------------
resource "google_sql_database_instance" "pg" {
  name                = "${local.name}-pg"
  database_version    = "POSTGRES_16"
  region              = var.region
  deletion_protection = local.is_prod
  encryption_key_name = google_kms_crypto_key.data.id
  depends_on          = [google_service_networking_connection.psa]

  settings {
    tier              = var.db_tier
    edition           = "ENTERPRISE"
    availability_type = var.db_ha ? "REGIONAL" : "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = 20
    disk_autoresize   = true
    user_labels       = local.labels

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
      ssl_mode        = "ENCRYPTED_ONLY"
    }

    backup_configuration {
      enabled                        = true
      start_time                     = "20:30" # UTC = 02:00 IST
      location                       = var.region
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = local.is_prod ? 30 : 7
        retention_unit   = "COUNT"
      }
    }

    maintenance_window {
      day  = 7  # Sunday
      hour = 21 # UTC = Monday 02:30 IST
    }

    insights_config {
      query_insights_enabled  = true
      record_application_tags = true
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "500"
    }
    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }
  }
}

resource "google_sql_database" "tola" {
  name     = "tola"
  instance = google_sql_database_instance.pg.name
}

# -----------------------------------------------------------------------------
# Memorystore · Redis 7 (RQ queues, rate limits, OTP throttling, idempotency keys)
# -----------------------------------------------------------------------------
resource "google_redis_instance" "cache" {
  name               = "${local.name}-redis"
  region             = var.region
  tier               = local.is_prod ? "STANDARD_HA" : "BASIC"
  memory_size_gb     = var.redis_memory_gb
  redis_version      = "REDIS_7_2"
  authorized_network = google_compute_network.vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  auth_enabled       = true
  transit_encryption_mode = "SERVER_AUTHENTICATION"
  labels             = local.labels
  depends_on         = [google_service_networking_connection.psa]
}

# -----------------------------------------------------------------------------
# Cloud Storage: audio (voice notes, TTS cache), photos (scale/piece), backups export
# -----------------------------------------------------------------------------
resource "google_storage_bucket" "media" {
  for_each                    = toset(["audio", "photos", "exports"])
  name                        = "${local.name}-${each.key}-${var.project_id}"
  location                    = upper(var.region) # ASIA-SOUTH1, single region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  labels                      = local.labels

  encryption { default_kms_key_name = google_kms_crypto_key.data.id }
  versioning { enabled = each.key != "audio" }

  lifecycle_rule {
    condition { age = 90 }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
  lifecycle_rule {
    condition { age = 365 }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
}

# Log sink bucket for CERT-In 180-day retention (logs stay in India)
resource "google_logging_project_bucket_config" "certin" {
  project          = var.project_id
  location         = var.region
  bucket_id        = "certin-180d"
  retention_days   = 400 # >= 180 days (CERT-In) and >= 1 year (DPDP Rules log requirement); see OBSERVABILITY.md
  locked           = local.is_prod
}
resource "google_logging_project_sink" "certin" {
  name                   = "certin-180d"
  destination            = "logging.googleapis.com/projects/${var.project_id}/locations/${var.region}/buckets/certin-180d"
  filter                 = "resource.type=(\"cloud_run_revision\" OR \"cloud_run_job\" OR \"cloudsql_database\" OR \"http_load_balancer\" OR \"audited_resource\") OR logName:\"cloudaudit.googleapis.com\""
  unique_writer_identity = true
  depends_on             = [google_logging_project_bucket_config.certin]
}

# -----------------------------------------------------------------------------
# Secret Manager (values added out-of-band; replicated only in asia-south1)
# -----------------------------------------------------------------------------
resource "google_secret_manager_secret" "s" {
  for_each  = toset(local.secrets)
  secret_id = each.value
  labels    = local.labels
  replication {
    user_managed {
      replicas { location = var.region }
    }
  }
}

# -----------------------------------------------------------------------------
# Service accounts
# -----------------------------------------------------------------------------
resource "google_service_account" "runtime" {
  account_id   = "tola-runtime"
  display_name = "Tola Cloud Run runtime (api, worker, migrate)"
}
resource "google_service_account" "web" {
  account_id   = "tola-web"
  display_name = "Tola web (no data access)"
}
resource "google_service_account" "deploy" {
  account_id   = "tola-deploy"
  display_name = "GitHub Actions deployer (via WIF)"
}
resource "google_service_account" "tasks" {
  account_id   = "tola-tasks"
  display_name = "Cloud Tasks / Scheduler invoker"
}

resource "google_project_iam_member" "runtime" {
  for_each = toset([
    "roles/cloudsql.client", "roles/cloudsql.instanceUser", "roles/secretmanager.secretAccessor",
    "roles/cloudtasks.enqueuer", "roles/cloudtrace.agent", "roles/monitoring.metricWriter",
    "roles/logging.logWriter",
  ])
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.runtime.email}"
}
resource "google_storage_bucket_iam_member" "runtime_media" {
  for_each = google_storage_bucket.media
  bucket   = each.value.name
  role     = "roles/storage.objectUser"
  member   = "serviceAccount:${google_service_account.runtime.email}"
}
resource "google_project_iam_member" "deploy" {
  for_each = toset(["roles/run.developer", "roles/cloudsql.viewer", "roles/logging.viewer"])
  project  = var.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.deploy.email}"
}
resource "google_service_account_iam_member" "deploy_actas" {
  for_each           = { runtime = google_service_account.runtime.name, web = google_service_account.web.name }
  service_account_id = each.value
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deploy.email}"
}
# Prod deployer also takes the pre-deploy Cloud SQL backup (scalable-deploy.yml)
resource "google_project_iam_member" "deploy_backup" {
  count   = local.is_prod ? 1 : 0
  project = var.project_id
  role    = "roles/cloudsql.editor"
  member  = "serviceAccount:${google_service_account.deploy.email}"
}

# -----------------------------------------------------------------------------
# Workload Identity Federation: GitHub OIDC -> tola-deploy (no JSON keys)
# -----------------------------------------------------------------------------
resource "google_iam_workload_identity_pool" "gh" {
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"
}
resource "google_iam_workload_identity_pool_provider" "gh" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.gh.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-oidc"
  attribute_mapping = {
    "google.subject"         = "assertion.sub"
    "attribute.repository"   = "assertion.repository"
    "attribute.ref"          = "assertion.ref"
    "attribute.environment"  = "assertion.environment"
  }
  # Only this repo, and only jobs bound to the matching GitHub environment, may mint tokens.
  attribute_condition = "assertion.repository == '${var.github_repo}' && assertion.environment == '${var.env}'"
  oidc { issuer_uri = "https://token.actions.githubusercontent.com" }
}
resource "google_service_account_iam_member" "wif_deploy" {
  service_account_id = google_service_account.deploy.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.gh.name}/attribute.repository/${var.github_repo}"
}

# -----------------------------------------------------------------------------
# Cloud Run services: web, api, worker  (+ migrate job)
# Images are managed by CI; Terraform ignores image/traffic drift.
# -----------------------------------------------------------------------------
resource "google_cloud_run_v2_service" "api" {
  name     = "tola-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL" # behind the external LB + Cloud Armor in prod
  labels   = local.labels

  template {
    service_account = google_service_account.runtime.email
    scaling {
      min_instance_count = var.api_min_instances
      max_instance_count = var.api_max_instances
    }
    max_instance_request_concurrency = 40
    timeout                          = "60s"
    vpc_access {
      network_interfaces {
        network    = google_compute_network.vpc.id
        subnetwork = google_compute_subnetwork.run.id
      }
      egress = "ALL_TRAFFIC" # forces egress through Cloud NAT static IP
    }
    volumes {
      name = "cloudsql"
      cloud_sql_instance { instances = [google_sql_database_instance.pg.connection_name] }
    }
    containers {
      image = "${local.image}/api:${var.image_tag}"
      ports { container_port = 8000 }
      resources {
        limits            = { cpu = "1", memory = "1Gi" }
        cpu_idle          = true
        startup_cpu_boost = true
      }
      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
      env {
        name  = "TOLA_ENV"
        value = var.env
      }
      env {
        name  = "AI_FALLBACK_MODE"
        value = "live"
      }
      env {
        name  = "GCS_BUCKET"
        value = google_storage_bucket.media["audio"].name
      }
      env {
        name  = "OTEL_EXPORTER_OTLP_ENDPOINT"
        value = "http://localhost:4317" # OTel collector sidecar (omitted in skeleton) -> Cloud Trace
      }
      dynamic "env" {
        for_each = {
          DATABASE_URL            = "tola-database-url"
          REDIS_URL               = "tola-redis-url"
          TOLA_SERVER_SIGNING_KEY = "tola-server-signing-key"
          LYZR_API_KEY            = "lyzr-api-key"
          SARVAM_API_KEY          = "sarvam-api-key"
          OTP_PROVIDER_KEY        = "otp-provider-key"
          WHATSAPP_TOKEN          = "whatsapp-token"
          IVR_PROVIDER_KEY        = "ivr-provider-key"
          PSP_KEY_ID              = "psp-key-id"
          PSP_KEY_SECRET          = "psp-key-secret"
        }
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.s[env.value].secret_id
              version = "latest"
            }
          }
        }
      }
      startup_probe {
        http_get { path = "/v1/health" }
        period_seconds    = 3
        failure_threshold = 10
      }
      liveness_probe {
        http_get { path = "/v1/health" }
        period_seconds = 30
      }
    }
  }
  lifecycle {
    ignore_changes = [template[0].containers[0].image, traffic, client, client_version, template[0].revision, template[0].labels]
  }
}

resource "google_cloud_run_v2_service" "worker" {
  name     = "tola-worker"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY" # only Cloud Tasks / Scheduler (OIDC) reach it
  labels   = local.labels
  template {
    service_account = google_service_account.runtime.email
    scaling {
      min_instance_count = 0
      max_instance_count = local.is_prod ? 20 : 3
    }
    max_instance_request_concurrency = 4 # agent calls are slow; keep concurrency low
    timeout                          = "900s"
    vpc_access {
      network_interfaces {
        network    = google_compute_network.vpc.id
        subnetwork = google_compute_subnetwork.run.id
      }
      egress = "ALL_TRAFFIC"
    }
    containers {
      image = "${local.image}/worker:${var.image_tag}"
      resources { limits = { cpu = "1", memory = "1Gi" } }
      env {
        name  = "TOLA_ENV"
        value = var.env
      }
      # Same secret_key_ref set as api (omitted for brevity in the skeleton)
    }
  }
  lifecycle {
    ignore_changes = [template[0].containers[0].image, traffic, client, client_version, template[0].revision, template[0].labels]
  }
}

resource "google_cloud_run_v2_service" "web" {
  name     = "tola-web"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"
  labels   = local.labels
  template {
    service_account = google_service_account.web.email
    scaling {
      min_instance_count = local.is_prod ? 1 : 0
      max_instance_count = local.is_prod ? 20 : 3
    }
    containers {
      image = "${local.image}/web:${var.image_tag}"
      ports { container_port = 3000 }
      resources { limits = { cpu = "1", memory = "512Mi" } }
      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = "https://api.${var.env == "prod" ? "" : "${var.env}."}tola.in" # placeholder domain
      }
      env {
        name  = "NEXT_PUBLIC_DEMO_MODE"
        value = "false"
      }
    }
  }
  lifecycle {
    ignore_changes = [template[0].containers[0].image, traffic, client, client_version, template[0].revision, template[0].labels]
  }
}

resource "google_cloud_run_v2_job" "migrate" {
  name     = "tola-migrate"
  location = var.region
  template {
    template {
      service_account = google_service_account.runtime.email
      max_retries     = 0
      timeout         = "900s"
      volumes {
        name = "cloudsql"
        cloud_sql_instance { instances = [google_sql_database_instance.pg.connection_name] }
      }
      containers {
        image   = "${local.image}/api:${var.image_tag}"
        command = ["alembic"]
        args    = ["upgrade", "head"]
        volume_mounts {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
        env {
          name = "DATABASE_URL"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.s["tola-database-url"].secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }
  lifecycle { ignore_changes = [template[0].template[0].containers[0].image, client, client_version] }
}

# Public invocation for web + api (auth is app-level OTP/JWT); worker stays private.
resource "google_cloud_run_v2_service_iam_member" "public" {
  for_each = { api = google_cloud_run_v2_service.api.name, web = google_cloud_run_v2_service.web.name }
  location = var.region
  name     = each.value
  role     = "roles/run.invoker"
  member   = "allUsers"
}
resource "google_cloud_run_v2_service_iam_member" "worker_invoker" {
  location = var.region
  name     = google_cloud_run_v2_service.worker.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.tasks.email}"
}

# -----------------------------------------------------------------------------
# Cloud Tasks queues + Cloud Scheduler (weekly reconciliation, F-05)
# -----------------------------------------------------------------------------
resource "google_cloud_tasks_queue" "q" {
  for_each = {
    reconcile = { rate = 5, concurrent = 5 }    # F-05 per shop-karigar pair
    notify    = { rate = 50, concurrent = 50 }  # WhatsApp / IVR / SMS fan-out (F-12)
    voice     = { rate = 10, concurrent = 10 }  # Sarvam STT/TTS + Lyzr intake (F-02, F-04)
    webhooks  = { rate = 20, concurrent = 20 }  # PSP / WhatsApp inbound processing (API-19, API-20)
  }
  name     = "${local.name}-${each.key}"
  location = var.region
  rate_limits {
    max_dispatches_per_second = each.value.rate
    max_concurrent_dispatches = each.value.concurrent
  }
  retry_config {
    max_attempts       = 8
    min_backoff        = "5s"
    max_backoff        = "600s"
    max_doublings      = 5
  }
  stackdriver_logging_config { sampling_ratio = 1.0 }
}

resource "google_cloud_scheduler_job" "weekly_reconcile" {
  name      = "${local.name}-weekly-reconcile"
  region    = var.region
  schedule  = "0 20 * * 6" # Saturday 20:00 IST: results ready for Sunday settlement
  time_zone = "Asia/Kolkata"
  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.worker.uri}/internal/reconcile/fanout"
    oidc_token { service_account_email = google_service_account.tasks.email }
  }
  retry_config { retry_count = 3 }
}

resource "google_cloud_scheduler_job" "chain_verify" {
  name      = "${local.name}-nightly-chain-verify"
  region    = var.region
  schedule  = "30 2 * * *" # 02:30 IST: re-verify every hash chain + signatures (F-03)
  time_zone = "Asia/Kolkata"
  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.worker.uri}/internal/ledger/verify-all"
    oidc_token { service_account_email = google_service_account.tasks.email }
  }
}

resource "google_cloud_scheduler_job" "passport_expiry" {
  name      = "${local.name}-passport-expiry"
  region    = var.region
  schedule  = "*/15 * * * *" # expire PassportShare tokens (E-14) promptly
  time_zone = "Asia/Kolkata"
  http_target {
    http_method = "POST"
    uri         = "${google_cloud_run_v2_service.worker.uri}/internal/passport/expire"
    oidc_token { service_account_email = google_service_account.tasks.email }
  }
}

# -----------------------------------------------------------------------------
# Edge (prod): external HTTPS LB + Cloud Armor (WAF, rate limit on OTP)
# Outline only: serverless NEG per service, URL map (app.* -> web, api.* -> api),
# managed certificate, Cloud Armor policy with OWASP CRS + 20 req/min/IP on /v1/auth/otp/*.
# -----------------------------------------------------------------------------
# resource "google_compute_region_network_endpoint_group" "api_neg" { ... }
# resource "google_compute_backend_service" "api" { security_policy = google_compute_security_policy.armor.id ... }
# resource "google_compute_security_policy" "armor" { ... }

# -----------------------------------------------------------------------------
# Monitoring: uptime checks + key alerts (full list in OBSERVABILITY.md §6)
# -----------------------------------------------------------------------------
resource "google_monitoring_notification_channel" "email" {
  display_name = "Tola on-call (${var.env})"
  type         = "email"
  labels       = { email_address = var.alert_email }
}

resource "google_monitoring_uptime_check_config" "api" {
  display_name = "${local.name} api health"
  timeout      = "10s"
  period       = "60s"
  http_check {
    path    = "/v1/health"
    use_ssl = true
    port    = 443
  }
  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = trimprefix(google_cloud_run_v2_service.api.uri, "https://")
    }
  }
  selected_regions = ["ASIA_PACIFIC", "EUROPE", "USA_OREGON"]
}

resource "google_monitoring_alert_policy" "api_5xx" {
  display_name = "${local.name} api 5xx > 2% for 5 min"
  combiner     = "OR"
  conditions {
    display_name = "5xx ratio"
    condition_monitoring_query_language {
      query    = <<-EOT
        fetch cloud_run_revision
        | metric 'run.googleapis.com/request_count'
        | filter resource.service_name == 'tola-api'
        | align rate(1m)
        | every 1m
        | group_by [], [err: sum(if(metric.response_code_class == '5xx', val(), 0.0)), all: sum(val())]
        | value [ratio: err / all]
        | condition ratio > 0.02
      EOT
      duration = "300s"
    }
  }
  notification_channels = [google_monitoring_notification_channel.email.id]
}

# -----------------------------------------------------------------------------
# Outputs (feed GitHub environment variables)
# -----------------------------------------------------------------------------
output "wif_provider" { value = google_iam_workload_identity_pool_provider.gh.name }
output "deploy_sa" { value = google_service_account.deploy.email }
output "runtime_sa" { value = google_service_account.runtime.email }
output "cloudsql_connection_name" { value = google_sql_database_instance.pg.connection_name }
output "cloudsql_instance" { value = google_sql_database_instance.pg.name }
output "egress_ip" { value = google_compute_address.egress.address }
output "api_url" { value = google_cloud_run_v2_service.api.uri }
output "web_url" { value = google_cloud_run_v2_service.web.uri }
