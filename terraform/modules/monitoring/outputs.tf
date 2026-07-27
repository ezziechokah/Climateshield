output "prometheus_workspace_endpoint" {
  value = aws_prometheus_workspace.main.prometheus_endpoint
}

output "oncall_sns_topic_arn" {
  value = aws_sns_topic.oncall_page.arn
}

output "application_log_group_name" {
  value = aws_cloudwatch_log_group.application.name
}
