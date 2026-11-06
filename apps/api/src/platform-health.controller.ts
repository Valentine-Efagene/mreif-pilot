import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../libs/auth/src/public.decorator';

@ApiTags('Platform')
@Controller()
export class PlatformHealthController {
  @Public()
  @Get('health')
  health() {
    return {
      status: 'healthy',
      service: 'mofi-platform-api',
      domains: ['agent', 'pmb', 'rsa', 'developer', 'uploader', 'cooperative'],
      timestamp: new Date().toISOString(),
    };
  }
}
