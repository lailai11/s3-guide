# Complete Proof of Concept (PoC) Setup: Secure S3 URL Generator (Starting from Scratch)

This guide provides a comprehensive, step-by-step process to set up a working Proof of Concept (PoC) for generating temporary S3 URLs. We'll start from having just a local GitHub project folder, build out the frontend and backend code, define the infrastructure using AWS CloudFormation, and prepare it for pushing to GitHub and deploying to your AWS account.

## **Phase 0: Local Project Setup**

We'll start by organizing all the necessary files and folders on your local computer.

**0.1. Create Your Local Project Directory**

If you haven't already, create a new directory for your project on your local machine and navigate into it using your terminal or command prompt:

```bash
mkdir s3-presigned-url-poc
cd s3-presigned-url-poc