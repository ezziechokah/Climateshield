# Root-level input variables. Environment-specific values live in
# terraform/environments/<env>/terraform.tfvars — never hardcode an
# environment's real value here.

variable "environment" {
  description = "Deployment environment name: dev | staging | production"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "environment must be one of: dev, staging, production."
  }
}

variable "aws_region" {
  description = "AWS region satisfying Kenya/Africa data-residency requirements (docs/05_Non_Functional_Requirements.md#data-residency). Placeholder until Phase 1 discovery finalizes the region (docs/42_Final_Project_Checklist.md)."
  type        = string
  default     = "af-south-1"
}

variable "project_name" {
  description = "Short project identifier used as a resource-name prefix."
  type        = string
  default     = "climateshield-nexus"
}

variable "vpc_cidr" {
  description = "CIDR block for the platform VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "kubernetes_node_count" {
  description = "Number of worker nodes in the EKS-equivalent cluster."
  type        = number
  default     = 3
}

variable "kubernetes_node_instance_type" {
  description = "Instance type for Kubernetes worker nodes."
  type        = string
  default     = "m6i.large"
}

variable "database_instance_class" {
  description = "RDS instance class for the managed PostgreSQL/PostGIS database (production/staging only — dev uses the in-cluster StatefulSet, see kubernetes/base/data/postgres.yaml)."
  type        = string
  default     = "db.r6g.large"
}

variable "database_allocated_storage_gb" {
  description = "Initial allocated storage for the managed database."
  type        = number
  default     = 100
}

variable "enable_multi_az" {
  description = "Whether to provision the database in multi-AZ HA mode (docs/architecture/system-architecture-views.md#high-availability-architecture). Always true for production."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Common resource tags applied everywhere for cost allocation and ownership tracking."
  type        = map(string)
  default = {
    Project   = "climateshield-nexus"
    ManagedBy = "terraform"
  }
}
