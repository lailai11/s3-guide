# Proof of Concept (PoC) Setup Guide: Secure S3 URL Generator

This guide walks you through setting up a fully functional PoC system that enables secure S3 file uploads and downloads using temporary, time-limited presigned URLs.

---

## Phase 0: Local Project Setup

### 0.1. Create Your Local Project Directory

```bash
mkdir s3-presigned-url-poc
cd s3-presigned-url-poc
```

### 0.2. Create Project Subdirectories

```bash
mkdir docs
mkdir -p backend/lambda_function
mkdir -p aws-infrastructure/cloudformation
```

Project structure:

```
s3-presigned-url-poc/
├── docs/
├── backend/
│   └── lambda_function/
└── aws-infrastructure/
    └── cloudformation/
```

### 0.3. Create `index.html`

Create an `index.html` file in the root directory and copy your interactive frontend HTML into it. Source: [index.html GitHub](https://github.com/lailai11/s3-guide/blob/main/s3-presigned-url-poc/index.html)

### 0.4. Create Lambda Function Code

Create `index.js` inside `backend/lambda_function/` and copy in the Lambda code.

### 0.5. Create CloudFormation Templates

Store these YAML files inside `aws-infrastructure/cloudformation/`.

#### `s3-poc-bucket.yaml`

Defines the S3 bucket.

#### `lambda-role-poc.yaml`

Defines IAM role and policies for Lambda.

#### `lambda-function-poc.yaml`

Defines the Lambda function. Ensure to update:

```yaml
Code:
  S3Bucket: my-poc-lambda-code-source-uniqueid-123
  S3Key: lambda-code/S3PresignedUrlGenerator.zip
```

#### `api-gateway-poc.yaml`

Defines API Gateway, methods, CORS, and stage deployment.

### 0.6. Create `.gitignore`

```gitignore
# Node.js
node_modules/
.env

# Lambda deployment
*.zip

# AWS CLI cache
.aws/

# OS generated files
.DS_Store
Thumbs.db
```

---

## Phase 1: GitHub Repository Setup

### 1.1. Create GitHub Repository

Create a new repository named `s3-presigned-url-poc` and make it public.

### 1.2. Initialize and Push

```bash
cd s3-presigned-url-poc
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/s3-presigned-url-poc.git
git push -u origin main
```

### 1.3. Enable GitHub Pages

In repo settings:

* Go to **Pages**
* Set source to **Deploy from a branch** → `main` → `/ (root)`
* Save and wait for publishing

---

## Phase 2: Prepare AWS Resources

### Prerequisites

* AWS CLI installed: [Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
* Run `aws configure`

### 2.1. Create S3 Bucket for Lambda Code

```bash
aws s3 mb s3://my-poc-lambda-code-source-uniqueid-123 --region us-east-1
```

### 2.2. Zip Lambda Code

```bash
cd backend/lambda_function
zip -r S3PresignedUrlGenerator.zip index.js
cd ../../
```

### 2.3. Upload to S3

```bash
aws s3 cp backend/lambda_function/S3PresignedUrlGenerator.zip \
  s3://my-poc-lambda-code-source-uniqueid-123/lambda-code/S3PresignedUrlGenerator.zip
```

### 2.4. Update `lambda-function-poc.yaml`

Set `S3Bucket` and `S3Key` correctly.

---

## Phase 3: Deploy Backend with CloudFormation

### 3.1. Deploy S3 Bucket Stack

```bash
aws cloudformation deploy \
  --stack-name S3PoCBucketStack \
  --template-file aws-infrastructure/cloudformation/s3-poc-bucket.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides PoCBucketName=my-poc-files-bucket-123abc
```

### 3.2. Deploy Lambda IAM Role Stack

```bash
aws cloudformation deploy \
  --stack-name PoCLambdaRoleStack \
  --template-file aws-infrastructure/cloudformation/lambda-role-poc.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    PoCBucketName=$(aws cloudformation describe-stacks \
      --stack-name S3PoCBucketStack \
      --query "Stacks[0].Outputs[?OutputKey=='PoCBucketNameOutput'].OutputValue" \
      --output text)
```

### 3.3. Deploy Lambda Function Stack

```bash
aws cloudformation deploy \
  --stack-name PoCLambdaFunctionStack \
  --template-file aws-infrastructure/cloudformation/lambda-function-poc.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    PoCLambdaRoleArn=$(...) \
    PoCBucketName=$(...) \
    LambdaCodeS3Bucket=my-poc-lambda-code-source-uniqueid-123 \
    LambdaCodeS3Key=lambda-code/S3PresignedUrlGenerator.zip
```

### 3.4. Deploy API Gateway Stack

```bash
aws cloudformation deploy \
  --stack-name PoCApiGatewayStack \
  --template-file aws-infrastructure/cloudformation/api-gateway-poc.yaml \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    PoCLambdaFunctionArn=$(...) \
    FrontendOrigin=https://your-username.github.io/s3-presigned-url-poc/
```

---

## Phase 4: Finalize Frontend

### 4.1. Retrieve API Gateway Invoke URL

AWS Console → API Gateway → `PoCS3PresignedUrlApi` → Stages → `poc` → Copy Invoke URL

### 4.2. Update `index.html`

```js
const apiGatewayEndpoint = 'https://your-api-id.execute-api.region.amazonaws.com/poc';
```

---

## Phase 5: Final Push & Testing

### 5.1. Commit Final Changes

```bash
git add .
git commit -m "Connected frontend to real API and updated CloudFormation templates"
git push origin main
```

### 5.2. Test GitHub Pages Site

* Navigate to your GitHub Pages URL
* Try both file upload and download
* Confirm files appear in your S3 bucket as expected

---

Congratulations. You have built a full-featured secure file upload/download PoC using AWS, GitHub, and presigned S3 URLs.
