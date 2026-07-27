# Remote state backend — encrypted, versioned, and locked so the 5-developer
# team never clobbers each other's `terraform apply`. Bucket/table names are
# environment-specific and passed via `-backend-config=environments/<env>/backend.hcl`
# (see terraform/environments/*/backend.hcl), never hardcoded here, so the
# same root module targets dev/staging/production without a code change.
#
# Initialize per environment:
#   terraform init -backend-config=environments/staging/backend.hcl
terraform {
  backend "s3" {
    # bucket, key, region, dynamodb_table are supplied via -backend-config
    encrypt = true
  }
}
