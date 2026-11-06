import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UsePipes,
    ValidationPipe,
    HttpStatus,
    ParseIntPipe,
    HttpCode,
    Patch,
} from '@nestjs/common';
import OpenApiHelper from '../common/OpenApiHelper';
import {
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    StandardApiResponse,
    UpdateDocumentStatusDto,
} from '../common/common.dto';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';
import { LicensingDocumentService } from './licensing-document.service';
import { CreateLicensingDocumentDto, UpdateLicensingDocumentDto } from './licensing-document.dto';
import { LicensingDocument } from './licensing-document.entity';
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';

@SwaggerAuth()
@Controller('licensing-documents')
@ApiTags('Licensing Documents')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class LicensingDocumentController {
    constructor(
        private readonly licensingDocumentService: LicensingDocumentService,
        private readonly s3UploaderService: S3UploaderService,
    ) { }

    @Post()
    @ApiOperation({
        summary: 'Upload a file',
        description: '',
    })
    async create(
        @Body() createlicensingDocumentDto: CreateLicensingDocumentDto,
    ): Promise<StandardApiResponse<LicensingDocument>> {
        const data = await this.licensingDocumentService.create(createlicensingDocumentDto);
        return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
    }

    @Get()
    @ApiResponse(OpenApiHelper.arrayResponseDoc)
    async findAll(): Promise<StandardApiResponse<LicensingDocument[]>> {
        const data = await this.licensingDocumentService.findAll();
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<StandardApiResponse<LicensingDocument>> {
        const data = await this.licensingDocumentService.findOne(id);
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id/update-status')
    //@Roles([UserRole.ADMIN])
    @ApiOperation({ summary: '', tags: ['Admin'] })
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateDocumentStatusDto,
    ): Promise<StandardApiResponse<LicensingDocument>> {
        const data = await this.licensingDocumentService.updateStatus(
            id,
            updateDto,
        );

        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateLicensingDocumentDto,
    ): Promise<StandardApiResponse<LicensingDocument>> {
        if (updateDto.url) {
            const document = await this.licensingDocumentService.findOne(id)

            try {
                await this.s3UploaderService.deleteFromS3(document.url)
            } catch (error) {
                console.log('Error while deleting a file from S3:', error)
            }
        }

        const data = await this.licensingDocumentService.updateOne(id, updateDto);
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseIntPipe) id: number,): Promise<StandardApiResponse<void>> {
        const document = await this.licensingDocumentService.findOne(id)
        await this.s3UploaderService.deleteFromS3(document.url)
        await this.licensingDocumentService.remove(id);

        return new StandardApiResponse(HttpStatus.NO_CONTENT, ResponseMessage.DELETED, null);
    }
}
