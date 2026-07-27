variable "project_name" { type = string }
variable "environment" { type = string }

variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }

variable "kubernetes_node_security_group_id" {
  type        = string
  description = "Security group of the EKS worker nodes — the only allowed ingress source."
}

variable "kms_key_arn" { type = string }

variable "instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "allocated_storage_gb" {
  type    = number
  default = 100
}

variable "multi_az" {
  type        = bool
  description = "Enable synchronous standby in a second AZ (docs/architecture/system-architecture-views.md#high-availability-architecture). Always true for production."
  default     = false
}

variable "tags" {
  type    = map(string)
  default = {}
}
