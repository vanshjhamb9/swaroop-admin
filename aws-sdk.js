import AWS from 'aws-sdk';

// Configure AWS SDK with environment variables (server-side only)
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Initialize S3 client
const s3 = new AWS.S3();
export default s3