import { Registry } from 'prom-client';
import { collectDefaultMetrics, Counter, Histogram } from "prom-client";

const registry = new Registry();
export default registry;

collectDefaultMetrics({ register: registry });

export const failedRequests = new Counter({
    name: 'cobalt_fail_request_count',
    help: 'Total number of failed requests',
    labelNames: ['service'],
});

export const successfulRequests = new Counter({
    name: 'cobalt_success_request_count',
    help: 'Total number of successful requests',
    labelNames: ['service'],
});

export const httpRequests = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'status'],
});
  
export const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5],
});

registry.registerMetric(failedRequests);
registry.registerMetric(successfulRequests);
registry.registerMetric(httpRequests);
registry.registerMetric(httpRequestDuration);

export function incrementFailed(type) {
    failedRequests.labels(type).inc();
}

export function incrementSuccessful(type) {
    successfulRequests.labels(type).inc();
}