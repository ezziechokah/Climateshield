variable "project_name" { type = string }
variable "environment" { type = string }

variable "oidc_provider_arn" {
  type        = string
  description = "IAM OIDC provider ARN for the EKS cluster (created alongside the compute module in the root main.tf)."
}

variable "oidc_issuer_url" {
  type        = string
  description = "From the compute module's cluster_oidc_issuer_url output."
}

variable "tags" {
  type    = map(string)
  default = {}
}
