import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AdminDeveloperCompanyRegistrationDto, AdminDeveloperProjectApplicationDto, DeveloperApprovedBusinessRegistrationDto, DeveloperDeclinedBusinessRegistrationDto, DeveloperProjectApplicationApprovalDto, DeveloperProjectApplicationDeclinedDto, DeveloperProjectApplicationSubmissionDto, INotificationResponse } from './notification.dto';
import EnvironmentHelper from '../common/helpers/EnvironmentHelper';
import { Request } from 'express';
import { RequestHelper } from '@qshelter/nest-auth';
import { PlatformNotificationService } from '../../../../libs/notifications/src/platform-notification.service';
import { PlatformLambdaInvokeService } from '../../../../libs/notifications/src/platform-lambda-invoke.service';

@Injectable()
export class NotificationService {
  baseUrl: string
  arn: string

  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly platformNotifications: PlatformNotificationService,
    private readonly platformLambdaInvoke: PlatformLambdaInvokeService,
  ) {
    this.baseUrl = EnvironmentHelper.env.notification_url
  }

  async sendEmailWithArn(applicantId: string, url: string) {
    const arn = EnvironmentHelper.env.notification_arn
    const payload = {
      applicant_id: applicantId,
      statement_url: url
    }

    if (!arn) {
      throw new InternalServerErrorException('Notification ARN not set')
    }

    const result = await this.platformLambdaInvoke.invokeFunction(arn, payload)
    this.logger.log({ result })
    return result;
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

  async sendProjectApplicationDeclined(dto: DeveloperProjectApplicationDeclinedDto, request: Request) {
    const route = '/developer/project-application-declined'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendProjectApplicationApproval(dto: DeveloperProjectApplicationApprovalDto, request: Request) {
    const route = '/developer/project-application-approval'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendProjectApplicationSubmission(dto: DeveloperProjectApplicationSubmissionDto, request: Request) {
    const route = '/developer/project-application-submission'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendAdminProjectApplicationSubmission(dto: AdminDeveloperProjectApplicationDto, request: Request) {
    const route = '/admin/developer-project-application'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendApprovedBusinessRegistration(dto: DeveloperApprovedBusinessRegistrationDto, request: Request) {
    const route = '/developer/approved-business-registration'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendDeclinedBusinessRegistration(dto: DeveloperDeclinedBusinessRegistrationDto, request: Request) {
    const route = '/developer/declined-business-registration'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }

  async sendCompanyRegistration(dto: AdminDeveloperCompanyRegistrationDto, request: Request) {
    const route = '/admin/developer-company-registration'
    const url = `${this.baseUrl}${route}`
    return await this.sendEmail(dto, url, request)
  }
}
