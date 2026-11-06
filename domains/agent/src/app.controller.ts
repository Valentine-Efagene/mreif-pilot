import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { StandardApiResponse } from './common/common.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  async test(): Promise<StandardApiResponse<any>> {
    return new StandardApiResponse(
      HttpStatus.OK,
      'Test endpoint working',
      {
        message: 'API is working',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        nodeVersion: process.version
      }
    );
  }
}
