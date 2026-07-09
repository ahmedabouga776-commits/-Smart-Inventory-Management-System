# Monitoring Setup — Prometheus + Grafana + Helm

Monitoring stack for the Smart Inventory microservices project.

## What Gets Monitored

| Layer | Target | Tool |
|-------|--------|------|
| Cluster | Nodes, pods, CPU, memory, restarts | kube-prometheus-stack |
| Apps | API Gateway + 6 microservices | prom-client `/metrics` |
| MongoDB | Connections, ops, storage | MongoDB Exporter |
| Redis | Memory, commands | Redis Exporter |
| RabbitMQ | Queue depth, message rates | RabbitMQ Exporter |
| Alerts | Service down, 5xx rate, latency, queue backlog | PrometheusRule |

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud)
- Helm 3 installed
- Application deployed to `default` namespace (`kubectl apply -f k8s/`)

## Step 1 — Rebuild services with metrics

Each service now exposes `/metrics` and an improved `/health` endpoint. Rebuild and push Docker images, then redeploy:

```bash
# Example for one service
docker build -t mahmoud416/auth-service:latest ./auth-service
docker push mahmoud416/auth-service:latest
kubectl rollout restart deployment auth-service
```

Repeat for: `api-gateway`, `auth-service`, `product-service`, `order-service`, `supplier-service`, `notification-service`.

Install dependencies locally:

```bash
for svc in api-gateway auth-service product-service order-service supplier-service notification-service; do
  (cd "$svc" && npm install)
done
```

## Step 2 — Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  -f helm/monitoring/kube-prometheus-stack-values.yaml
```

## Step 3 — Install infrastructure exporters

Deploy app infrastructure first, then install exporters (they scrape services in `default` namespace):

```bash
helm install mongodb-exporter prometheus-community/prometheus-mongodb-exporter \
  -n monitoring \
  -f helm/monitoring/mongodb-exporter-values.yaml

helm install redis-exporter prometheus-community/prometheus-redis-exporter \
  -n monitoring \
  -f helm/monitoring/redis-exporter-values.yaml

helm install rabbitmq-exporter prometheus-community/prometheus-rabbitmq-exporter \
  -n monitoring \
  -f helm/monitoring/rabbitmq-exporter-values.yaml
```

## Step 4 — Apply ServiceMonitors and alert rules

```bash
kubectl apply -f k8s/monitoring/
```

## Step 5 — Access dashboards

**Grafana** (default NodePort 30300):

```bash
kubectl port-forward svc/kube-prometheus-grafana -n monitoring 3000:80
```

Open http://localhost:3000 — login: `admin` / `changeme` (change in values file).

**Prometheus**:

```bash
kubectl port-forward svc/kube-prometheus-prometheus -n monitoring 9090:9090
```

Open http://localhost:9090

## Recommended Grafana Dashboards (import by ID)

| ID | Name |
|----|------|
| 1860 | Node Exporter Full |
| 315 | Kubernetes cluster monitoring |
| 2583 | MongoDB |
| 763 | Redis |
| 10991 | RabbitMQ |

## Verify scraping

In Prometheus UI → Status → Targets, confirm these are **UP**:

- `api-gateway`, `auth-service`, `product-service`, `order-service`, `supplier-service`, `notification-service`
- `mongodb-exporter`, `redis-exporter`, `rabbitmq-exporter`

Test metrics locally (Docker Compose):

```bash
curl http://localhost:8081/metrics   # API Gateway
curl http://localhost:4002/metrics   # Product Service
curl http://localhost:4002/health    # Health with MongoDB status
```

## Alert rules

Custom alerts are defined in `k8s/monitoring/prometheus-rules.yaml`:

- **MicroserviceDown** — scrape target unreachable for 1m
- **HighHttpErrorRate** — 5xx rate > 5% for 5m
- **HighRequestLatency** — p95 latency > 2s
- **RabbitMQQueueBacklog** — queue messages > 100
- **PodCrashLooping** — > 3 restarts in 15m

## Uninstall

```bash
helm uninstall rabbitmq-exporter redis-exporter mongodb-exporter -n monitoring
helm uninstall kube-prometheus -n monitoring
kubectl delete -f k8s/monitoring/
kubectl delete namespace monitoring
```

## File layout

```
helm/monitoring/
├── kube-prometheus-stack-values.yaml
├── mongodb-exporter-values.yaml
├── redis-exporter-values.yaml
├── rabbitmq-exporter-values.yaml
└── README.md

k8s/monitoring/
├── servicemonitors.yaml
└── prometheus-rules.yaml
```
