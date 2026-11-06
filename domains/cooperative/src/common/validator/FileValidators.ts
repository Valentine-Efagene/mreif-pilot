import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import FileSize from '../../s3-uploader/util/FileSize';

export default class FileValidators {
  public static imageValidator = new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: '.(jpg|jpeg|png)',
    })
    .addMaxSizeValidator({
      maxSize: 10 * FileSize.MB,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });

  public static csvValidator = new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: '.(csv)',
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
      fileType: '.(jpg|jpeg|png|ppt|pptx|doc|docx|pdf|xls|xlsx|svg|webp)',
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    });

  public static OptionalFileValidator = new ParseFilePipeBuilder()
    .addMaxSizeValidator({
      maxSize: 100 * FileSize.MB,
    })
    .addFileTypeValidator({
      fileType: '.(jpg|jpeg|png|ppt|pptx|doc|docx|pdf|xls|xlsx|svg|webp)',
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      fileIsRequired: false
    });
}
