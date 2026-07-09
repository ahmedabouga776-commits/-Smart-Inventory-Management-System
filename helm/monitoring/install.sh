#!/usr/bin/env bash
set -euo pipefail

RELEASE="${RELEASE:-kube-prometheus}"
NAMESPACE="${NAMESPACE:-monitoring}"

echo "==> Adding Helm repos..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

echo "==> Installing / upgrading kube-prometheus-stack..."
helm upgrade --install "$RELEASE" prometheus-community/kube-prometheus-stack \
  --namespace "$NAMESPACE" \
  --create-namespace \
  -f helm/monitoring/kube-prometheus-stack-values.yaml

echo "==> Applying Prometheus alert rules and ServiceMonitor..."
kubectl apply -f k8s/monitoring/prometheus-rules.yaml
kubectl apply -f k8s/monitoring/servicemonitors.yaml

echo "==> Applying Grafana dashboards..."
kubectl apply -f k8s/monitoring/dashboards/


echo "  Grafana:    kubectl port-forward svc/${RELEASE}-grafana -n $NAMESPACE 3000:80"
echo "              Login: admin / changeme"
echo ""
echo "  Prometheus: kubectl port-forward svc/${RELEASE}-kube-prome-prometheus -n $NAMESPACE 9090:9090"
