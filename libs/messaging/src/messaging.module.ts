import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DOMAIN_COMMAND_CONSUMER_ROLES } from './domain-commands';
import { domainCommandsQueueName } from './domain-commands';
import {
  MOFI_NOTIFICATIONS_QUEUE,
  MOFI_VERIFIER_LAMBDA_QUEUE,
} from './message-envelope';
import {
  getValkeyConnectionOptions,
  MOFI_BULL_KEY_PREFIX,
} from './valkey-config';

const producerQueueNames = [
  MOFI_NOTIFICATIONS_QUEUE,
  MOFI_VERIFIER_LAMBDA_QUEUE,
  ...DOMAIN_COMMAND_CONSUMER_ROLES.map((domain) =>
    domainCommandsQueueName(domain),
  ),
];

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: getValkeyConnectionOptions(config),
        prefix: MOFI_BULL_KEY_PREFIX,
      }),
    }),
    BullModule.registerQueue(
      ...producerQueueNames.map((name) => ({ name })),
    ),
  ],
  exports: [BullModule],
})
export class MofiMessagingModule {}
