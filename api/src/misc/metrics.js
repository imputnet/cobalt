import { collectDefaultMetrics, Counter, Histogram, Registry, AggregatorRegistry } from 'prom-client';
  
import cluster from 'node:cluster';

export const WORKER_ID = `worker_${cluster.worker?.id ?? process.pid}`;

export const registry = new Registry();
export const aggregatorRegistry = new AggregatorRegistry();

collectDefaultMetrics({
    register: registry
});

export const failedRequests = new Counter({
    name: 'cobalt_fail_request_count',
    help: 'Total number of failed requests',
    labelNames: ['service', 'worker_id'],
});

export const successfulRequests = new Counter({
    name: 'cobalt_success_request_count',
    help: 'Total number of successful requests',
    labelNames: ['service', 'worker_id'],
});

export const httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'status', 'worker_id'],
});

export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'worker_id'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5],
});

registry.registerMetric(failedRequests);
registry.registerMetric(successfulRequests);
registry.registerMetric(httpRequests);
registry.registerMetric(httpRequestDuration);

export function incrementFailed(service) {
    failedRequests.labels(service, WORKER_ID).inc();
}

export function incrementSuccessful(service) {
    successfulRequests.labels(service, WORKER_ID).inc();
}