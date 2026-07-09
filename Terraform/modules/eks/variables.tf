variable "cluster_name" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "create_sa_iam_role" {
  type    = bool
  default = false
}

variable "create_ebs_csi_addon" {
  type    = bool
  default = true
}

variable "create_kubernetes_service_account" {
  type    = bool
  default = false
}

variable "sa_name" {
  type    = string
  default = ""
}

variable "sa_namespace" {
  type    = string
  default = "default"
}

variable "sa_policy_arns" {
  type    = list(string)
  default = []
}