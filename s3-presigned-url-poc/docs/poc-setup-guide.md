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

### 0.5. Create CloudFormation Templa
