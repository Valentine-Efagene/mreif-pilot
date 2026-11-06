import { BadRequestException } from '@nestjs/common';
import { ApprovalStatus } from '../common.enum';
import { DeveloperService } from '../../developer/developer.service';
import { ProposedDevelopmentService } from '../../proposed-development/proposed-development.service';
import { ProposedDevelopmentApprovalStatus } from '../../proposed-development/proposed-development.enums';
import { Request } from 'express';

export default class DataHelper {
  public static async safeCheckDeveloperChild(developerId: number, developerService: DeveloperService, request: Request) {
    const developer = await developerService.findOne(developerId);

    if (developer.status === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Developer is already approved')
    } else {
      await developerService.updateStatus(developerId, {
        status: ApprovalStatus.PENDING,
        reviewerId: developer.reviewedBy
      }, request)
    }
  }

  public static async safeCheckProposedDevelopmentChild(proposedDevelopmentId: number, proposedDevelopmentService: ProposedDevelopmentService, request: Request) {
    const project = await proposedDevelopmentService.findOne(proposedDevelopmentId);

    if (project.status === ProposedDevelopmentApprovalStatus.APPROVED) {
      throw new BadRequestException('This project is already approved')
    } else {
      await proposedDevelopmentService.updateStatus(proposedDevelopmentId, {
        status: ProposedDevelopmentApprovalStatus.PENDING,
        reviewerId: project.reviewedBy
      }, request)
    }
  }
}
