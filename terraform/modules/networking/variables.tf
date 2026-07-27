variable "project_name" {
  type        = string
  description = "Resource name prefix."
}

variable "environment" {
  type        = string
  description = "dev | staging | production"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC."
}

variable "availability_zones" {
  type        = list(string)
  description = "AZs to spread subnets across (>=2 required for HA, docs/architecture/system-architecture-views.md#high-availability-architecture)."
  default     = ["af-south-1a", "af-south-1b"]
}

variable "single_nat_gateway" {
  type        = bool
  description = "Use one shared NAT gateway (cheaper, dev/staging) instead of one per AZ (production, avoids a cross-AZ single point of failure)."
  default     = true
}

variable "tags" {
  type        = map(string)
  default     = {}
}
