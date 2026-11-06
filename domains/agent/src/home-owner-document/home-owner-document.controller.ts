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
import { S3UploaderService } from '../s3-uploader/s3-uploader.service';
import { HomeOwnerDocumentService } from './home-owner-document.service';
import { CreateHomeOwnerDocumentDto, UpdateHomeOwnerDocumentDto } from './home-owner-document.dto';
import { HomeOwnerDocument } from './home-owner-document.entity';

@SwaggerAuth()
@Controller('home-owner-documents')
@ApiTags('HomeOwner Documents')
@ApiHeader(OpenApiHelper.userIdHeader)
@ApiResponse(OpenApiHelper.responseDoc)
export class HomeOwnerDocumentController {
    constructor(
        private readonly licensingDocumentService: HomeOwnerDocumentService,
        private readonly s3UploaderService: S3UploaderService,
    ) { }

    @HttpCode(HttpStatus.OK)
    @Post(':id/update-status')
    //@Roles([UserRole.ADMIN])
    @ApiOperation({ summary: '', tags: ['Admin'] })
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateDocumentStatusDto,
    ): Promise<StandardApiResponse<HomeOwnerDocument>> {
        const data = await this.licensingDocumentService.updateStatus(
            id,
            updateDto,
        );

        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.UPDATED, data);
    }

    @Post()
    @ApiOperation({
        summary: 'Upload a file',
        description: '',
    })
    async create(
        @Body() createlicensingDocumentDto: CreateHomeOwnerDocumentDto,
    ): Promise<StandardApiResponse<HomeOwnerDocument>> {
        const data = await this.licensingDocumentService.create(createlicensingDocumentDto);
        return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<StandardApiResponse<HomeOwnerDocument>> {
        const data = await this.licensingDocumentService.findOne(id);
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
    }

    @Get()
    @ApiResponse(OpenApiHelper.arrayResponseDoc)
    async findAll(): Promise<StandardApiResponse<HomeOwnerDocument[]>> {
        const data = await this.licensingDocumentService.findAll();
        return new StandardApiResponse(HttpStatus.OK, ResponseMessage.FETCHED, data);
    }

    @ApiHeader(OpenApiHelper.userIdHeader)
    @Patch(':id')
    async updateRsa(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateHomeOwnerDocumentDto,
    ): Promise<StandardApiResponse<HomeOwnerDocument>> {
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
