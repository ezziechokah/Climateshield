variable "project_name" { type = string }
variable "environment" { type = string }

variable "hosted_zone_id" {
  type        = string
  description = "Route53 hosted zone ID for climateshield-nexus.example (or the real production domain once assigned)."
  default     = ""
}

variable "api_hostname" {
  type    = string
  default = "api.climateshield-nexus.example"
}

variable "app_hostname" {
  type    = string
  default = "app.climateshield-nexus.example"
}

variable "nlb_dns_name" {
  type        = string
  description = "Hostname of the ingress-nginx-provisioned NLB, once known (empty on first apply, before the cluster's ingress controller exists)."
  default     = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}
