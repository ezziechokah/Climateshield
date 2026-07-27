# Pins Terraform and provider versions so `terraform init` produces the same
# plan for every developer and every CI run. Bump deliberately via PR, never
# silently — see docs/17_Coding_Standards.md for the review bar on
# infra changes.
terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.32"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 4.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}
