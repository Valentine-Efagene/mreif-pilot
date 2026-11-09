/** Topic exchange for dotted routing keys (`developer.assets.purge`, …). */
export const MOFI_DOMAIN_COMMANDS_EXCHANGE = 'mofi.domain.commands';

/**
 * @deprecated Legacy single-queue name; use {@link domainCommandsQueueName} per domain.
 */
export const MOFI_DOMAIN_COMMANDS_QUEUE = MOFI_DOMAIN_COMMANDS_EXCHANGE;

export function domainCommandsQueueName(domain: string): string {
  return `mofi.${domain}.commands`;
}

/** Nest RMQ `routingKey` binding for a domain consumer (`developer.#`, …). */
export function domainCommandsBindingKey(domain: string): string {
  return `${domain}.#`;
}

/** Container roles (`MOFI_CONTAINER_ROLE`) that host domain-command consumers. */
export const DOMAIN_COMMAND_CONSUMER_ROLES = ['developer'] as const;

export type DomainCommandConsumerRole =
  (typeof DOMAIN_COMMAND_CONSUMER_ROLES)[number];

export function isDomainCommandConsumerRole(
  role: string,
): role is DomainCommandConsumerRole {
  return (DOMAIN_COMMAND_CONSUMER_ROLES as readonly string[]).includes(role);
}
