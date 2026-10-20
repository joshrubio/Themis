resource "aws_s3_bucket" "reports" {
  bucket = "acme-compliance-reports"
}

resource "aws_s3_bucket_acl" "reports_acl" {
  bucket = aws_s3_bucket.reports.id
  acl    = "public-read"
}

resource "aws_s3_bucket_versioning" "reports_versioning" {
  bucket = aws_s3_bucket.reports.id
  versioning_configuration {
    status = "Disabled"
  }
}

# Note: no aws_s3_bucket_server_side_encryption_configuration, no
# aws_s3_bucket_logging, and no aws_s3_bucket_public_access_block for
# this bucket.
