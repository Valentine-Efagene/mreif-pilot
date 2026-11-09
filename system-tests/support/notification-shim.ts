import * as http from 'http';
import type { AddressInfo } from 'net';
import { isMailpitReachable, relayToMailpit } from './mailpit-relay';

export type ShimCapturedCall = {
  method: string;
  path: string;
  body: unknown;
};

/**
 * Minimal stand-in for the external Qshelter notification HTTP API.
 * Records template POSTs; optional Mailpit relay is handled in mailpit-relay.ts.
 */
export function startNotificationShim(): Promise<{
  baseUrl: string;
  calls: ShimCapturedCall[];
  close: () => Promise<void>;
}> {
  const calls: ShimCapturedCall[] = [];

  const server = http.createServer(async (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end();
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    let body: unknown = raw;
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = raw;
    }

    calls.push({
      method: req.method ?? 'POST',
      path: req.url ?? '/',
      body,
    });

    if (
      process.env.SYSTEM_TEST_MAILPIT === 'true' &&
      body &&
      typeof body === 'object' &&
      'to_email' in (body as Record<string, unknown>)
    ) {
      const payload = body as Record<string, unknown>;
      const mailpitUp = await isMailpitReachable();
      if (mailpitUp) {
        await relayToMailpit({
          to: String(payload.to_email),
          subject: `MOFI system test: ${req.url ?? 'notification'}`,
          html: `<pre>${JSON.stringify(payload, null, 2)}</pre>`,
        });
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true }));
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as AddressInfo).port;
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        calls,
        close: () =>
          new Promise<void>((done, reject) => {
            server.close((err) => (err ? reject(err) : done()));
          }),
      });
    });
  });
}
