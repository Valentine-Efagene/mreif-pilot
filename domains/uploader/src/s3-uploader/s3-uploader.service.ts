import { Injectable, Logger } from '@nestjs/common';
import AWSUtil from '../util/AwsUtil';
import ImageUtil from '../util/ImageUtil';
import UrlUtil from '../util/UrlUtil';
import stream, { Readable, PassThrough } from 'node:stream'
import AwsUtil from '../util/AwsUtil';
//import { ConfigService } from '@nestjs/config';
import archiver from 'archiver';
import { ByteLogger } from './util/ByteLogger';

@Injectable()
export class S3UploaderService {
  private readonly logger = new Logger(S3UploaderService.name);
  //constructor(private readonly configService: ConfigService) { }

  async uploadFileToS3(file, folder: string) {
    const path = await AWSUtil.uploadFileToS3(
      file.buffer,
      folder,
      ImageUtil.customFilename(file),
      file.fileType,
    );
    return path;
  }

  async uploadImageToS3(file, folder: string) {
    const path = await AWSUtil.uploadImageToS3(
      file.buffer,
      folder,
      ImageUtil.customFilename(file),
      file.fileType,
    );
    return path;
  }

  async deleteFromS3(url: string) {
    const key = UrlUtil.getKey(url);
    await AWSUtil.deleteFromS3(key);
  }

  async getPresignedUrl(url: string) {
    const key = UrlUtil.getKey(url);
    return await AWSUtil.createPresignedUrl(key);
  }

  async createPresignedPost(key: string) {
    return await AWSUtil.createPresignedPost(key);
  }

  async bundle(archiveKey: string, objectUrls: string[]): Promise<string> {
    const FORMAT = 'zip'
    const archiveStream = archiver(FORMAT)

    archiveStream.on('error', (error: any) => {
      this.logger.error('Archival encountered an error:', error)
      throw new Error(error)
    })

    const passthrough = new stream.PassThrough()
    const byteLogger = new ByteLogger();
    archiveStream
      .pipe(byteLogger)
      .pipe(passthrough)

    const objectKeys = objectUrls.map(url => AwsUtil.getKeyFromUrl(url))
    const responses = await Promise.allSettled(objectKeys.map((key) => AwsUtil.getObject(key)))

    // Filter out failed responses
    responses.forEach((result, index) => {
      if (result.status === "fulfilled") {
        archiveStream.append(result.value.Body as stream.Readable, {
          name: objectKeys[index].split('/').at(-1)
        })
      } else {
        this.logger.warn(`Failed to fetch object: ${objectKeys[index]}`, result.reason)
      }
    })

    const key = `${archiveKey}.${FORMAT}`
    // const key = await AwsUtil.buildKey(`${archiveKey}.${FORMAT}`)

    /**
     * The order of these calls matter
     * You need to initialize the promise for the upload first,
     * so it's open for passthrough, wait for the archive to finalize, 
     * then await the upload promise, else the process gets stuck for 
     * large files
     */

    const uploadPromise = AwsUtil.uploadStream(key, passthrough, "application/zip")
    await archiveStream.finalize()
    await uploadPromise
    const presignedUrl = await AwsUtil.createPresignedUrlFromKey(key)
    return presignedUrl
  }

  async testUploadStream() {
    const FORMAT = 'zip'
    const archiveStream = archiver(FORMAT)

    archiveStream.on('error', (error: any) => {
      this.logger.error('Archival encountered an error:', error)
      throw new Error(error)
    })

    const key = `archive/test-file-${Date.now()}.bin`;
    const fileSize = 5.5 * 1024 * 1024; // 5.5 MB

    this.logger.log(`Simulating file stream of size: ${fileSize} bytes`);

    let bytesGenerated = 0;

    const readableStream = new Readable({
      read(size) {
        const remaining = fileSize - bytesGenerated;
        if (remaining <= 0) {
          this.push(null); // Signal end of stream
          return;
        }

        const chunkSize = Math.min(size, remaining);
        this.push(Buffer.alloc(chunkSize, Math.random() * 255));
        bytesGenerated += chunkSize;
      }
    });

    // Pipe into a PassThrough stream
    const passThrough = new PassThrough();
    readableStream.pipe(passThrough);

    passThrough.on('data', (chunk) => this.logger.log(`Generated chunk: ${chunk.length} bytes`));
    passThrough.on('end', () => this.logger.log('Stream generation completed'));

    // Upload to S3
    await AwsUtil.uploadStream(key, passThrough, "application/zip");
  }
}
