module "vpc" {
  source = "./modules/vpc"

  vpc_cidr              = "10.0.0.0/16"
  region                = "us-east-1"
  public_subnet_1_cidr  = "10.0.1.0/24"
  public_subnet_2_cidr  = "10.0.2.0/24"
  private_subnet_1_cidr = "10.0.3.0/24"
  private_subnet_2_cidr = "10.0.4.0/24"
  cluster_name          = "dev-cluster"
}

module "security_groups" {
  source = "./modules/security-groups"

  vpc_id                    = module.vpc.vpc_id
  cluster_security_group_id = module.eks.cluster_security_group_id
}

module "eks" {
  source = "./modules/eks"

  cluster_name = "dev-cluster"
  subnet_ids   = module.vpc.private_subnets

  # Enable IRSA for EBS CSI driver service account
  create_sa_iam_role                = true
  create_ebs_csi_addon              = true
  create_kubernetes_service_account = false
  sa_name                           = "ebs-csi-controller-sa"
  sa_namespace                      = "kube-system"
  sa_policy_arns                    = ["arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"]
}

module "nodegroup" {
  source = "./modules/nodegroup"

  cluster_name              = module.eks.cluster_name
  node_group_name           = "workers"
  cluster_endpoint          = module.eks.cluster_endpoint
  cluster_security_group_id = module.eks.cluster_security_group_id
  subnet_ids                = module.vpc.private_subnets
  instance_types            = ["m7i-flex.large"]
  node_security_group_id    = module.security_groups.node_sg_id

  desired_size = 2
  min_size     = 1
  max_size     = 3
}