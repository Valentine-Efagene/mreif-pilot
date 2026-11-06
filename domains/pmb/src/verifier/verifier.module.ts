import { Module } from '@nestjs/common';
import { VerifierService } from './verifier.service';
import { VerfierController } from './verifier.controller';

@Module({
  providers: [VerifierService],
  controllers: [VerfierController],
  exports: [VerifierService],
})
export class VerifierModule {}
