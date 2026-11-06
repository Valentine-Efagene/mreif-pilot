import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../libs/auth/src/public.decorator';

@Controller()
export class WorkerHealthController {
  @Public()
  @Get('health')
  health() {
    return { status: 'healthy', runtime: 'worker' };
  }
}
