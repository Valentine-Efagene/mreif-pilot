import { Controller, Get, Type } from '@nestjs/common';
import { Public } from '../../auth/src/public.decorator';

export function createDomainHealthController(domainName: string): Type<unknown> {
  @Controller('health')
  class DomainHealthController {
    @Public()
    @Get()
    health() {
      return {
        status: 'healthy',
        domain: domainName,
        timestamp: new Date().toISOString(),
      };
    }
  }
  return DomainHealthController;
}
