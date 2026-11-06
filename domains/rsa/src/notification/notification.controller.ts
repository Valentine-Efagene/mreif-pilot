import {
  Body,
  Controller,
  Post,
  HttpStatus,
  Req,
  HttpCode,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import OpenApiHelper from '../common/OpenApiHelper';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import { StandardApiResponse } from '../common/common.dto';
import { RsaApplicationApprovedDto } from './notification.dto';

@SwaggerAuth()
@Controller('notifications')
@ApiTags('Notification')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class PropertyController {
  constructor(
    private readonly notificationService: NotificationService,
  ) { }

  @HttpCode(HttpStatus.OK)
  @Post('test-email')
  @ApiOperation({
    summary: 'Send test email',
    description: '',
  })
  async sendEmail(
    @Body() body: RsaApplicationApprovedDto,
    @Req() request: Request
  ) {
    const response = await this.notificationService.sendRsaApplicationApproved(body, request);
    return new StandardApiResponse(HttpStatus.OK, 'Sent', response);
  }
}
