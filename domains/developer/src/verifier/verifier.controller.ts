import { Body, Controller, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { RcVerificationDto } from './verfier.dto';
import { VerifierService } from './verifier.service';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from '../common/common.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '@qshelter/nest-auth';

@SwaggerAuth()
@Controller('verifier')
@ApiTags('RC Verification')
@ApiHeader(OpenApiHelper.userIdHeader)
export class VerfierController {
  constructor(private readonly verifierService: VerifierService) { }

  @Post('verify_rc_number')
  async verifyRcNumber(
    @Body() verifierDto: RcVerificationDto,
  ): Promise<StandardApiResponse<string>> {
    const data = await this.verifierService.verifyRcn(
      verifierDto.rcNumber,
      verifierDto.businessType,
    );

    if (!data) {
      return new StandardApiResponse(HttpStatus.OK, 'Not Found', null);
    }

    return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
  }
}
