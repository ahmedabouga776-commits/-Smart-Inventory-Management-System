output "node_group_name" {
  value = aws_eks_node_group.workers.node_group_name
}

output "node_group_arn" {
  value = aws_eks_node_group.workers.arn
}

output "node_group_status" {
  value = aws_eks_node_group.workers.status
}

output "node_role_arn" {
  value = aws_iam_role.node_role.arn
}

output "node_group_id" {
  value = aws_eks_node_group.workers.id
}