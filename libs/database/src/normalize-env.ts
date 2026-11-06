/**
 * Align developer-func lowercase env vars with the standard MOFI Lambda names.
 */
export function normalizeMofiEnv(): void {
  const map: Record<string, string> = {
    db_host: 'DB_HOST',
    db_port: 'DB_PORT',
    db_username: 'DB_USERNAME',
    db_password: 'DB_PASSWORD',
    db_name: 'DB_NAME',
    node_env: 'NODE_ENV',
    aws_s3_bucket_name: 'AWS_S3_BUCKET_NAME',
    aws_s3_access_key_id: 'AWS_S3_ACCESS_KEY_ID',
    aws_s3_secret_access_key: 'AWS_S3_SECRET_ACCESS_KEY',
    aws_s3_region: 'AWS_S3_REGION',
  };

  for (const [from, to] of Object.entries(map)) {
    if (process.env[from] && !process.env[to]) {
      process.env[to] = process.env[from];
    }
  }

  if (process.env.AWS_S3_BUCKET_NAME && !process.env.CUSTOM_AWS_S3_BUCKET_NAME) {
    process.env.CUSTOM_AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
  }
  if (process.env.AWS_S3_ACCESS_KEY_ID && !process.env.CUSTOM_AWS_ACCESS_KEY_ID) {
    process.env.CUSTOM_AWS_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID;
  }
  if (process.env.AWS_S3_SECRET_ACCESS_KEY && !process.env.CUSTOM_AWS_SECRET_ACCESS_KEY) {
    process.env.CUSTOM_AWS_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY;
  }
  if (process.env.AWS_S3_REGION && !process.env.CUSTOM_AWS_REGION) {
    process.env.CUSTOM_AWS_REGION = process.env.AWS_S3_REGION;
  }

  // Keep legacy AWS_S3_* vars in sync when only CUSTOM_* is set (local MinIO profiles)
  if (process.env.CUSTOM_AWS_S3_BUCKET_NAME && !process.env.AWS_S3_BUCKET_NAME) {
    process.env.AWS_S3_BUCKET_NAME = process.env.CUSTOM_AWS_S3_BUCKET_NAME;
  }
  if (process.env.CUSTOM_AWS_ACCESS_KEY_ID && !process.env.AWS_S3_ACCESS_KEY_ID) {
    process.env.AWS_S3_ACCESS_KEY_ID = process.env.CUSTOM_AWS_ACCESS_KEY_ID;
  }
  if (process.env.CUSTOM_AWS_SECRET_ACCESS_KEY && !process.env.AWS_S3_SECRET_ACCESS_KEY) {
    process.env.AWS_S3_SECRET_ACCESS_KEY = process.env.CUSTOM_AWS_SECRET_ACCESS_KEY;
  }
  if (process.env.CUSTOM_AWS_REGION && !process.env.AWS_S3_REGION) {
    process.env.AWS_S3_REGION = process.env.CUSTOM_AWS_REGION;
  }
}
