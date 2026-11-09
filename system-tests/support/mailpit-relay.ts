const DEFAULT_MAILPIT_API = 'http://127.0.0.1:8025';

export type MailpitMessageSummary = {
  ID: string;
  Subject: string;
  To?: Array<{ Address: string }>;
};

export function mailpitApiBase(): string {
  return process.env.SYSTEM_TEST_MAILPIT_API ?? DEFAULT_MAILPIT_API;
}

/** Push a simplified HTML message into Mailpit (requires `mailpit` on :8025). */
export async function relayToMailpit(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<void> {
  const res = await fetch(`${mailpitApiBase()}/api/v1/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      From: options.from ?? 'system-tests@mofi.local',
      To: [options.to],
      Subject: options.subject,
      HTML: options.html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mailpit send failed (${res.status}): ${text}`);
  }
}

export async function fetchMailpitMessages(): Promise<MailpitMessageSummary[]> {
  const res = await fetch(`${mailpitApiBase()}/api/v1/messages`);
  if (!res.ok) {
    throw new Error(`Mailpit list failed (${res.status})`);
  }
  const data = (await res.json()) as { messages?: MailpitMessageSummary[] };
  return data.messages ?? [];
}

export async function isMailpitReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${mailpitApiBase()}/api/v1/info`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
