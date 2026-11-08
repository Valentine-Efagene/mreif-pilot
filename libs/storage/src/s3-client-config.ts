import { S3ClientConfig } from '@aws-sdk/client-s3';

function envTruthy(value: string | undefined): boolean {
  if (!value) return false;
  return ['1', 'true', 'yes'].includes(value.toLowerCase());
}

export function getS3ClientConfig(): S3ClientConfig {
  const endpoint = process.env.CUSTOM_AWS_ENDPOINT;
  const forcePathStyle =
    envTruthy(process.env.CUSTOM_AWS_FORCE_PATH_STYLE) || Boolean(endpoint);

  const accessKeyId =
    process.env.CUSTOM_AWS_ACCESS_KEY_ID ?? process.env.AWS_S3_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.CUSTOM_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_S3_SECRET_ACCESS_KEY;

  const config: S3ClientConfig = {
    region: process.env.CUSTOM_AWS_REGION ?? process.env.AWS_S3_REGION ?? 'us-east-1',
  };

  // ECS Fargate: omit credentials so the SDK uses the task IAM role.
  if (accessKeyId && secretAccessKey) {
    config.credentials = { accessKeyId, secretAccessKey };
  }

  if (endpoint) {
    config.endpoint = endpoint;
    config.forcePathStyle = forcePathStyle;
  }

  return config;
}

export function getS3BucketName(): string | undefined {
  return process.env.CUSTOM_AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET_NAME;
}

/** Public object URL after upload (AWS or MinIO path-style). */
export function buildS3PublicObjectUrl(key: string): string {
  const bucket = getS3BucketName();
  const endpoint = process.env.CUSTOM_AWS_ENDPOINT;

  if (endpoint && bucket) {
    const base = endpoint.replace(/\/$/, '');
    return `${base}/${bucket}/${key}`;
  }

  return `https://${bucket}.s3.amazonaws.com/${key}`;
}

/** Parse object key from a stored URL (AWS or MinIO). */
export function getKeyFromStoredUrl(url: string, bucket?: string): string {
  const bucketName = bucket ?? getS3BucketName();
  const endpoint = process.env.CUSTOM_AWS_ENDPOINT;

  if (endpoint && bucketName && url.includes(`${bucketName}/`)) {
    const idx = url.indexOf(`${bucketName}/`);
    return url.slice(idx + bucketName.length + 1);
  }

  if (url.includes('amazonaws.com/')) {
    return url.split('amazonaws.com/').at(-1) ?? url;
  }

  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts[0] === bucketName) {
      return parts.slice(1).join('/');
    }
    return parts.join('/');
  } catch {
    return url;
  }
}
