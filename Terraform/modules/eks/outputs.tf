output "cluster_name" {
  value = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.this.endpoint
}

output "cluster_arn" {
  value = aws_eks_cluster.this.arn
}

output "cluster_security_group_id" {
  value = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
}

output "cluster_ca" {
  value = aws_eks_cluster.this.certificate_authority[0].data
}

output "cluster_role_arn" {
  value = aws_iam_role.eks_cluster_role.arn
}

output "sa_role_arn" {
  value = var.create_sa_iam_role ? aws_iam_role.sa_role[0].arn : ""
}

output "sa_role_name" {
  value = var.create_sa_iam_role ? aws_iam_role.sa_role[0].name : ""
}

output "oidc_provider_host" {
  value = var.create_sa_iam_role ? replace(aws_eks_cluster.this.identity[0].oidc[0].issuer, "https://", "") : ""
}