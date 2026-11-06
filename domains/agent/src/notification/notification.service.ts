import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { RequestHelper } from '@qshelter/nest-auth';
import { AgentApprovedRegistrationDto, AgentDeclinedRegistrationDto, AgentOnboardingCompletedDto, HomeOwnerOnboardingCompleteDto, INotificationResponse } from './notification.dto';
import EnvironmentHelper from '../common/helpers/EnvironmentHelper';
import { PlatformNotificationService } from '../../../../libs/notifications/src/platform-notification.service';

@Injectable()
export class NotificationService {
  baseUrl: string
  arn: string

  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly platformNotifications: PlatformNotificationService,
  ) {
    this.baseUrl = EnvironmentHelper.env.NOTIFICATION_URL
  }

  async sendEmail(emailDto: any, endpoint: string, request: Request): Promise<INotificationResponse> {
    if (!this.baseUrl) {
      throw new InternalServerErrorException('Notification endpoint not set')
    }

    return (await this.platformNotifications.postNotification(
      endpoint,
      emailDto,
      RequestHelper.getAuthorizationHeader(request),
    )) as INotificationResponse;
  }

  async sendAgentApplicationDeclined(dto: AgentDeclinedRegistrationDto, request: Request) {
    const route = '/agent/declined-registration'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendAgentApplicationApproved(dto: AgentApprovedRegistrationDto, request: Request) {
    const route = '/agent/approved-registration'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendAgentOnboardingCompleted(dto: AgentOnboardingCompletedDto, request: Request) {
    const route = '/agent/onboarding-completed'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendHomeownerOnboardingCompleted(dto: HomeOwnerOnboardingCompleteDto, request: Request) {
    const route = '/homeowner/onboarding-completed'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }
}