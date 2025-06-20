const AWS = require('aws-sdk');
const S3 = new AWS.S3({ signatureVersion: 'v4', region: process.env.AWS_REGION });

exports.handler = async (event) => {
    const bucketName = process.env.S3_BUCKET_NAME;
    const objectKey = event.queryStringParameters ? event.queryStringParameters.key : null;
    const expiresSeconds = 300; // URL valid for 5 minutes
    const action = event.queryStringParameters && event.queryStringParameters.action ? event.queryStringParameters.action : 'getObject';
    const contentType = event.queryStringParameters && event.queryStringParameters.contentType ? event.queryStringParameters.contentType : null;

    if (!objectKey) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Missing "key" query parameter for the S3 object.' })
        };
    }

    if (!['getObject', 'putObject'].includes(action)) {
         return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Invalid "action" specified. Must be "getObject" or "putObject".' })
        };
    }

    try {
        const params = {
            Bucket: bucketName,
            Key: objectKey,
            Expires: expiresSeconds
        };

        if (action === 'putObject' && contentType) {
            params.ContentType = contentType;
        }

        const url = await S3.getSignedUrlPromise(action, params);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Keep * for easy PoC testing
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ presignedUrl: url, key: objectKey, action: action })
        };
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Failed to generate presigned URL.', error: error.message })
        };
    }
};