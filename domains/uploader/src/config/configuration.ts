export default () => ({
    region: process.env.aws_region,
    aws_secret_access_key: process.env.aws_secret_access_key,
    aws_region: process.env.aws_region,
    presigned_url_ttl: process.env.presigned_url_ttl,
    aws_s3_property_bucket: process.env.aws_s3_property_bucket,
    aws_property_bucket_access_key_id: process.env.aws_property_bucket_access_key_id,
    aws_property_bucket_secret_access_key: process.env.aws_property_bucket_secret_access_key,
    aws_property_bucket_region: process.env.aws_property_bucket_region,
});
