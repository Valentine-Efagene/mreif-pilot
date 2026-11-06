export const MOFI_NOTIFICATIONS_QUEUE = 'mofi.notifications.commands';
export const MOFI_VERIFIER_LAMBDA_QUEUE = 'mofi.verifier.lambda.commands';

export type MessageEnvelope<T = unknown> = {
  eventName: string;
  schemaVersion: number;
  correlationId: string;
  payload: T;
  authContext?: {
    authorizationHeader?: string;
  };
};

export type HttpNotificationCommand = {
  url: string;
  body: unknown;
};

export type LambdaInvokeCommand = {
  functionArn: string;
  payload: unknown;
};

export function buildEnvelope<T>(
  eventName: string,
  payload: T,
  authContext?: MessageEnvelope['authContext'],
): MessageEnvelope<T> {
  return {
    eventName,
    schemaVersion: 1,
    correlationId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    payload,
    authContext,
  };
}
