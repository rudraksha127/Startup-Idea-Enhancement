# Monitoring & Observability Infrastructure

AgencyOS exports Prometheus metrics from the Express backend (`/metrics`) and tracks execution latency, error rates, and active webhooks.
n8n worker queues and system health probes are scraped every 15 seconds.

