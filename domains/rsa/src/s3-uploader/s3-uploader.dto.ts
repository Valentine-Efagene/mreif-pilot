import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The file to be uploaded',
    example: 'example.pdf',
  })
  @IsNotEmpty()
  file: Express.Multer.File;

  @ApiProperty({
    example: 'avatar',
  })
  @IsNotEmpty()
  folder: string;
}

export class ImageUploadDto {
  @ApiProperty({
    format: 'binary',
    description:
      'Image with max size of 10MB. The image will be resized before upload',
    example: 'example.jpg',
  })
  @IsNotEmpty()
  file: Express.Multer.File;

  @ApiProperty()
  @IsNotEmpty()
  folder: string;
}
