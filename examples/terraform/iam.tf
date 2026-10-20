resource "aws_iam_policy" "deploy_bot" {
  name = "deploy-bot-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "*"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_user" "deploy_bot" {
  name = "deploy-bot"
}

resource "aws_iam_access_key" "deploy_bot" {
  user = aws_iam_user.deploy_bot.name
}

# Note: long-lived access key for a CI user, attached to a policy with
# no scoping and no MFA condition.
