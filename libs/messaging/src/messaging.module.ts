import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  MOFI_NOTIFICATIONS_QUEUE,
  MOFI_VERIFIER_LAMBDA_QUEUE,
} from './message-envelope';
import {
  buildDomainCommandsProducerOptions,
  buildRmqClientOptions,
  getAmqpUrls,
} from './rmq-config';

export const NOTIFICATIONS_CLIENT = 'NOTIFICATIONS_CLIENT';
export const VERIFIER_LAMBDA_CLIENT = 'VERIFIER_LAMBDA_CLIENT';
export const DOMAIN_COMMANDS_CLIENT = 'DOMAIN_COMMANDS_CLIENT';

@Global()
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: buildRmqClientOptions(config, MOFI_NOTIFICATIONS_QUEUE),
        }),
      },
      {
        name: VERIFIER_LAMBDA_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: buildRmqClientOptions(config, MOFI_VERIFIER_LAMBDA_QUEUE),
        }),
      },
      {
        name: DOMAIN_COMMANDS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: buildDomainCommandsProducerOptions(config),
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MofiMessagingModule {}

