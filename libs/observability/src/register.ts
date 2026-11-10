/**
 * Load with `node -r ./dist/libs/observability/src/register.js` before Nest bootstraps.
 * Active only when OTEL_EXPORTER_OTLP_ENDPOINT is set (Grafana Cloud, Tempo, etc.).
 */
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();

if (endpoint) {
  const role = process.env.MOFI_CONTAINER_ROLE?.trim();
  const serviceName =
    process.env.OTEL_SERVICE_NAME?.trim() ||
    (role ? `mofi-${role}` : 'mofi-platform-api');
  const stage = process.env.MOFI_STAGE?.trim() || process.env.NODE_ENV || 'development';

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    'service.namespace': 'mofi-platform-api',
    'deployment.environment': stage,
  });

  const sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  });

  sdk.start();
  // eslint-disable-next-line no-console
  console.log(
    `[otel] exporting traces service=${serviceName} endpoint=${endpoint}`,
  );

  const shutdown = () => {
    sdk.shutdown().catch(() => undefined);
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
