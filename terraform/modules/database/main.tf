# Database module — managed PostgreSQL/PostGIS for staging/production
# (docs/architecture/ADR-002-postgis-timescaledb-data-platform.md). Dev uses
# the in-cluster StatefulSet (kubernetes/base/data/postgres.yaml) instead —
# this module is not invoked for the dev environment (see
# terraform/environments/dev/terraform.tfvars).
#
# NOTE: RDS PostgreSQL supports the postgis extension but NOT the
# timescaledb extension — TimescaleDB requires either Timescale's managed
# cloud offering or a self-managed instance/StatefulSet. This module
# provisions the PostGIS-bearing primary store only; the TimescaleDB
# decision is tracked as a Phase 1 discovery item (docs/42_Final_Project_Checklist.md).

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnets"
  subnet_ids = var.private_subnet_ids
  tags       = var.tags
}

resource "aws_security_group" "database" {
  name_prefix = "${var.project_name}-${var.environment}-db-"
  vpc_id      = var.vpc_id
  description = "Allow Postgres only from the Kubernetes node security group (docs/13_Security_Design.md#network-security)."

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.kubernetes_node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-${var.environment}"
  engine         = "postgres"
  engine_version = "15.7"
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage_gb
  max_allocated_storage = var.allocated_storage_gb * 4 # storage autoscaling ceiling
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn

  db_name  = "climateshield_nexus"
  username = "climateshield_app"
  # Password is generated and stored in Vault by the secrets module — RDS is
  # configured to fetch it via manage_master_user_password, never a plain
  # Terraform variable (docs/13_Security_Design.md#secrets-management).
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]

  multi_az                     = var.multi_az
  backup_retention_period       = var.environment == "production" ? 35 : 7 # docs/30_Backup_and_Recovery.md#retention-policy
  backup_window                 = "01:00-02:00" # Africa/Nairobi off-peak (UTC times; adjust in deploy runbook)
  maintenance_window            = "sun:02:30-sun:04:30"
  deletion_protection           = var.environment == "production"
  skip_final_snapshot           = var.environment != "production"
  final_snapshot_identifier     = var.environment == "production" ? "${var.project_name}-${var.environment}-final" : null
  performance_insights_enabled  = true
  performance_insights_kms_key_id = var.kms_key_arn

  tags = var.tags
}
