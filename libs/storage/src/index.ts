export { S3UploaderModule } from '../../../domains/uploader/src/s3-uploader/s3-uploader.module';
export { S3UploaderService } from '../../../domains/uploader/src/s3-uploader/s3-uploader.service';
export {
  buildS3PublicObjectUrl,
  getKeyFromStoredUrl,
  getS3BucketName,
  getS3ClientConfig,
} from './s3-client-config';
