import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import ImageUtil from './ImageUtil';
import {
  buildS3PublicObjectUrl,
  getS3BucketName,
  getS3ClientConfig,
} from '../../../../../libs/storage/src/s3-client-config';

export default class AwsUtil {
  private static readonly s3Client = new S3Client(getS3ClientConfig());
  private static readonly bucketName = getS3BucketName();

  public static async uploadToS3(
    file: any,
    folder: string,
    fileName: string,
    mimeType: string,
    transform: (file) => Promise<Buffer>,
  ) {
    const filePath = `${folder}/${fileName}`;
    const input: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: filePath,
      Body: await transform(file),
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(input);

    await this.s3Client.send(command);

    return buildS3PublicObjectUrl(filePath);
  }

  public static async deleteFromS3(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await this.s3Client.send(command);
  }

  public static async uploadImageToS3(
    file: any,
    folder: string,
    fileName: string,
    mimeType: string,
  ) {
    return this.uploadToS3(file, folder, fileName, mimeType, (file) =>
      ImageUtil.resizeImage(file),
    );
  }

  public static async uploadFileToS3(
    file: any,
    folder: string,
    fileName: string,
    mimeType: string,
  ) {
    return this.uploadToS3(
      file.buffer,
      folder,
      fileName,
      mimeType,
      async (file) => file,
    );
  }
}
