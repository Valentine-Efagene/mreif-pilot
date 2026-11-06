import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import FileSize from '../../s3-uploader/util/FileSize';

export default class FileValidators {
  public static imageValidator = new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: '.(jpg|jpeg|png|svg|webp)',
    })
    .addMaxSizeValidator({
      maxSize: 10 * FileSize.MB,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });

  public static fileValidator = new ParseFilePipeBuilder()
    .addMaxSizeValidator({
      maxSize: 100 * FileSize.MB,
    })
    .addFileTypeValidator({
      fileType: '.(jpg|jpeg|png|svg|ppt|pptx|doc|docx|pdf|xls|xlsx|csv|webp)',
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
}
