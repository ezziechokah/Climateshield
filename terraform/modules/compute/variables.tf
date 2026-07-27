variable "project_name" { type = string }
variable "environment" { type = string }

variable "kubernetes_version" {
  type        = string
  description = "EKS control-plane version."
  default     = "1.30"
}

variable "vpc_id" {
  type        = string
  description = "From the networking module's vpc_id output."
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "From the networking module's private_subnet_ids output."
}

variable "cluster_role_arn" {
  type        = string
  description = "IAM role ARN for the EKS control plane (from the iam module)."
}

variable "node_role_arn" {
  type        = string
  description = "IAM role ARN for worker nodes (from the iam module)."
}

variable "kms_key_arn" {
  type        = string
  description = "KMS key ARN for encrypting Kubernetes Secrets at rest (from the secrets module)."
}

variable "node_count" {
  type        = number
  default     = 3
}

variable "node_instance_type" {
  type        = string
  default     = "m6i.large"
}

variable "tags" {
  type    = map(string)
  default = {}
}
