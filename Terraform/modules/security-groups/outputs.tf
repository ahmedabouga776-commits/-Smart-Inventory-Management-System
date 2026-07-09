output "nlb_sg_id" {
  value = aws_security_group.nlb.id
}

output "node_sg_id" {
  value = aws_security_group.node.id
}