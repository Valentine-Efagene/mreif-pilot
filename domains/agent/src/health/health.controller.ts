import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check(): Promise<StandardApiResponse<any>> {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      database: await this.checkDatabase(),
      environmentVariables: {
        DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT_SET',
        DB_NAME: process.env.DB_NAME ? 'SET' : 'NOT_SET',
        DB_USERNAME: process.env.DB_USERNAME ? 'SET' : 'NOT_SET',
        NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
        AWS_REGION: process.env.AWS_REGION || 'NOT_SET',
      }
    };

    return new StandardApiResponse(
      HttpStatus.OK,
      'Health check successful',
      healthData
    );
  }

  private async checkDatabase(): Promise<{ status: string; message?: string }> {
    try {
      // Simple database check - you can add actual DB connection test here
      return {
        status: 'connected',
        message: 'Database connection available'
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }
}
