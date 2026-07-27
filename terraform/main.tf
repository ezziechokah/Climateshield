# Root module — wires the 8 modules together in dependency order. Run via:
#   terraform init -backend-config=environments/<env>/backend.hcl
#   terraform apply -var-file=environments/<env>/terraform.tfvars
# See terraform/MODULES.md for the full module reference and
# docs/15_Deployment_Guide.md#infrastructure-as-code for the operating model.

provider "aws" {
  region = var.aws_region
}

module "secrets" {
  source       = "./modules/secrets"
  project_name = var.project_name
  environment  = var.environment
  tags         = var.tags
}

module "networking" {
  source       = "./modules/networking"
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  tags         = var.tags
}

module "iam" {
  source       = "./modules/iam"
  project_name = var.project_name
  environment  = var.environment
  # NOTE (two-pass apply): the compute and iam modules are mutually
  # dependent in a real EKS+IRSA setup — the cluster needs an IAM role to be
  # created, and the IRSA role needs the cluster's OIDC issuer to exist.
  # First apply targets modules.compute (using a bootstrap cluster role
  # created inline), then a second apply wires the real IRSA role using the
  # now-known OIDC issuer. See terraform/MODULES.md#known-limitations for
  # the exact two-step command sequence.
  oidc_provider_arn = module.compute.cluster_oidc_issuer_url
  oidc_issuer_url   = module.compute.cluster_oidc_issuer_url
  tags              = var.tags
}

module "compute" {
  source             = "./modules/compute"
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  cluster_role_arn   = module.iam.eks_cluster_role_arn
  node_role_arn      = module.iam.eks_node_role_arn
  kms_key_arn        = module.secrets.kms_key_arn
  node_count         = var.kubernetes_node_count
  node_instance_type = var.kubernetes_node_instance_type
  tags               = var.tags
}

module "storage" {
  source                 = "./modules/storage"
  raw_bucket_name        = "${var.project_name}-${var.environment}-raw"
  processed_bucket_name  = "${var.project_name}-${var.environment}-processed"
  reports_bucket_name    = "${var.project_name}-${var.environment}-reports"
  kms_key_arn            = module.secrets.kms_key_arn
  tags                   = var.tags
}

module "database" {
  source                             = "./modules/database"
  project_name                       = var.project_name
  environment                        = var.environment
  vpc_id                             = module.networking.vpc_id
  private_subnet_ids                 = module.networking.private_subnet_ids
  kubernetes_node_security_group_id  = module.compute.node_security_group_id
  kms_key_arn                        = module.secrets.kms_key_arn
  instance_class                     = var.database_instance_class
  allocated_storage_gb               = var.database_allocated_storage_gb
  multi_az                           = var.enable_multi_az
  tags                               = var.tags
}

module "monitoring" {
  source       = "./modules/monitoring"
  project_name = var.project_name
  environment  = var.environment
  kms_key_arn  = module.secrets.kms_key_arn
  tags         = var.tags
}

module "load_balancer" {
  source       = "./modules/load-balancer"
  project_name = var.project_name
  environment  = var.environment
  tags         = var.tags
}
