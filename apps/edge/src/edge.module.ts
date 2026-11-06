import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EdgeHealthController } from './edge-health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [EdgeHealthController],
})
export class EdgeModule {}
