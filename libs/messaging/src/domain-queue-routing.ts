import { domainCommandsQueueName } from './domain-commands';

/** First segment of dotted `eventName` (e.g. `developer` from `developer.assets.purge`). */
export function domainFromEventName(eventName: string): string {
  const dot = eventName.indexOf('.');
  if (dot <= 0) {
    throw new Error(`Invalid domain event name: ${eventName}`);
  }
  return eventName.slice(0, dot);
}

export function queueForDomainEvent(eventName: string): string {
  return domainCommandsQueueName(domainFromEventName(eventName));
}
