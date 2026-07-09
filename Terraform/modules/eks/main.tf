resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn

  vpc_config {
    subnet_ids = var.subnet_ids
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

resource "aws_eks_addon" "ebs_csi" {
  count = var.create_ebs_csi_addon ? 1 : 0

  cluster_name                = aws_eks_cluster.this.name
  addon_name                  = "aws-ebs-csi-driver"
  service_account_role_arn    = var.create_sa_iam_role ? aws_iam_role.sa_role[0].arn : null
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"

  timeouts {
    create = "30m"
    update = "30m"
    delete = "30m"
  }

  depends_on = [
    aws_iam_role_policy_attachment.sa_policy_attachments,
    aws_eks_cluster.this,
  ]
}

# Optional: create IAM OIDC provider and an IAM Role that can be assumed by a Kubernetes ServiceAccount (IRSA)
data "tls_certificate" "oidc" {
  count = var.create_sa_iam_role ? 1 : 0
  url   = aws_eks_cluster.this.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "oidc" {
  count           = var.create_sa_iam_role ? 1 : 0
  url             = aws_eks_cluster.this.identity[0].oidc[0].issuer
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.oidc[0].certificates[0].sha1_fingerprint]
}

locals {
  oidc_provider_host = var.create_sa_iam_role ? replace(aws_eks_cluster.this.identity[0].oidc[0].issuer, "https://", "") : ""
}

resource "aws_iam_role" "sa_role" {
  count = var.create_sa_iam_role ? 1 : 0

  name = "${var.cluster_name}-${var.sa_namespace}-${var.sa_name}-sa-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.oidc[0].arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${local.oidc_provider_host}:sub" = "system:serviceaccount:${var.sa_namespace}:${var.sa_name}"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "sa_policy_attachments" {
  count      = var.create_sa_iam_role ? length(var.sa_policy_arns) : 0
  role       = aws_iam_role.sa_role[0].name
  policy_arn = var.sa_policy_arns[count.index]
}

# Configure Kubernetes provider to create/annotate the ServiceAccount
data "aws_eks_cluster_auth" "this" {
  count = var.create_sa_iam_role ? 1 : 0
  name  = aws_eks_cluster.this.name
}

provider "kubernetes" {
  alias                  = "eks"
  host                   = var.create_sa_iam_role ? aws_eks_cluster.this.endpoint : null
  cluster_ca_certificate = var.create_sa_iam_role ? base64decode(aws_eks_cluster.this.certificate_authority[0].data) : null
  token                  = var.create_sa_iam_role ? data.aws_eks_cluster_auth.this[0].token : null
}

resource "kubernetes_service_account_v1" "sa" {
  count = var.create_sa_iam_role && var.create_kubernetes_service_account ? 1 : 0

  provider = kubernetes.eks

  metadata {
    name      = var.sa_name
    namespace = var.sa_namespace
    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.sa_role[0].arn
    }
  }

  depends_on = [
    aws_iam_openid_connect_provider.oidc,
    aws_iam_role.sa_role,
    data.aws_eks_cluster_auth.this
  ]
}