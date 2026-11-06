import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RsaApplicationAcknowledgementDto, RsaApplicationApprovedDto, RsaApplicationDeclinedDto } from './notification.dto';
import RequestHelper from '../common/helpers/RequestHelper';
import { PlatformNotificationService } from '../../../../libs/notifications/src/platform-notification.service';
import { PlatformLambdaInvokeService } from '../../../../libs/notifications/src/platform-lambda-invoke.service';

@Injectable()
export class NotificationService {
  baseUrl: string
  arn: string

  constructor(
    private readonly platformNotifications: PlatformNotificationService,
    private readonly platformLambdaInvoke: PlatformLambdaInvokeService,
  ) {
    this.baseUrl = process.env.NOTIFICATION_URL
  }

  async sendEmailWithArn(applicantId: string, url: string) {
    const arn = process.env.NOTIFICATION_ARN
    const payload = {
      applicant_id: applicantId,
      statement_url: url
    }

    if (!arn) {
      throw new InternalServerErrorException('Notification ARN not set')
    }

    const result = await this.platformLambdaInvoke.invokeFunction(arn, payload)
    console.log({ result })
    return result;
  }

  async sendEmail(emailDto: any, endpoint: string, request: Request): Promise<string> {
    if (!this.baseUrl) {
      throw new InternalServerErrorException('Notification endpoint not set')
    }

    return (await this.platformNotifications.postNotification(
      endpoint,
      emailDto,
      RequestHelper.getAuthorizationHeader(request),
    )) as string;
  }

  async sendRsaApplicationDeclined(dto: RsaApplicationDeclinedDto, request: Request) {
    const route = '/email/rsa/application-declined'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendRsaApplicationApproved(dto: RsaApplicationApprovedDto, request: Request) {
    const route = '/email/rsa/application-approved'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendRsaApplicationAcknowledgement(dto: RsaApplicationAcknowledgementDto, request: Request) {
    const route = '/email/rsa/acknowledge-application'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }
}
