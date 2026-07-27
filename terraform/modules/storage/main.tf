# Storage module — the three object storage zones from
# docs/06_System_Architecture.md#data-architecture (raw, processed, reports),
# each versioned, encrypted, and with lifecycle rules matching the retention
# policy in docs/30_Backup_and_Recovery.md#retention-policy.

locals {
  buckets = {
    raw       = var.raw_bucket_name
    processed = var.processed_bucket_name
    reports   = var.reports_bucket_name
  }
}

resource "aws_s3_bucket" "zones" {
  for_each = local.buckets
  bucket   = each.value
  tags     = merge(var.tags, { Zone = each.key })
}

resource "aws_s3_bucket_versioning" "zones" {
  for_each = aws_s3_bucket.zones
  bucket   = each.value.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "zones" {
  for_each = aws_s3_bucket.zones
  bucket   = each.value.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "zones" {
  for_each                = aws_s3_bucket.zones
  bucket                  = each.value.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Reports zone: 3-year retention then transition to cold storage, per
# docs/30_Backup_and_Recovery.md#retention-policy.
resource "aws_s3_bucket_lifecycle_configuration" "reports" {
  bucket = aws_s3_bucket.zones["reports"].id
  rule {
    id     = "reports-retention"
    status = "Enabled"
    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }
    transition {
      days          = 365
      storage_class = "GLACIER"
    }
    expiration {
      days = 1095 # 3 years
    }
  }
}

# Raw/processed climate data: indefinite retention (scientific value, per
# docs/27_Data_Models.md) — no expiration rule, but transition to
# Infrequent Access after 6 months to control cost.
resource "aws_s3_bucket_lifecycle_configuration" "raw_processed" {
  for_each = { for k, v in aws_s3_bucket.zones : k => v if k != "reports" }
  bucket   = each.value.id
  rule {
    id     = "cost-optimize"
    status = "Enabled"
    transition {
      days          = 180
      storage_class = "STANDARD_IA"
    }
  }
}
