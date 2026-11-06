import { Controller } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import OpenApiHelper from '../common/OpenApiHelper';
//import { CommonService } from './common.service';
@Controller('common')
@ApiTags('Common')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class CommonController {
  //constructor(private readonly commonService: CommonService) { }
}
