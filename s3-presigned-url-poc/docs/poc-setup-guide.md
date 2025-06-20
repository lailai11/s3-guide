Complete Proof of Concept (PoC) Setup: Secure S3 URL Generator (Starting from Scratch)
This guide provides a comprehensive, step-by-step process to set up a working Proof of Concept (PoC) for generating temporary S3 URLs. We'll start from having just a local GitHub project folder, build out the frontend and backend code, define the infrastructure using AWS CloudFormation, and prepare it for pushing to GitHub and deploying to your AWS account.

Phase 0: Local Project Setup
We'll start by organizing all the necessary files and folders on your local computer.

0.1. Create Your Local Project Directory

If you haven't already, create a new directory for your project on your local machine and navigate into it using your terminal or command prompt:

mkdir s3-presigned-url-poc
cd s3-presigned-url-poc

This new directory (s3-presigned-url-poc/) will serve as the root of your local GitHub project.

0.2. Create Project Subdirectories

Now, create the necessary subdirectories within your project folder. These folders will house your documentation, backend Lambda code, and AWS CloudFormation templates:

mkdir docs
mkdir -p backend/lambda_function
mkdir -p aws-infrastructure/cloudformation

Your folder structure should now explicitly look like this:

s3-presigned-url-poc/
├── docs/
├── backend/
│   └── lambda_function/
└── aws-infrastructure/
    └── cloudformation/

0.3. Create index.html (Frontend Interactive Guide)

This is the interactive web application that users will view and interact with in their browsers.

Create a new file named index.html directly inside your s3-presigned-url-poc/ (the root of your project) directory.

On Windows, you can typically run notepad index.html from your terminal in that directory.

On macOS/Linux, you might use nano index.html or open it with your preferred code editor.

Copy the entire HTML content for your interactive guide from our conversation history. You'll find the full HTML code in the immersive artifact with id="s3-secure-transfer-spa". Paste that HTML content into your index.html file and save it.

0.4. Create backend/lambda_function/index.js (Lambda Function Code)

This JavaScript file contains the code for your S3PresignedUrlGenerator Lambda function.

Navigate into the backend/lambda_function/ directory:

cd backend/lambda_function/

Create a new file named index.js in this directory.

Copy and paste the entire Node.js code for the Lambda function from our conversation history. You'll find the code in the immersive artifact with id="lambda-function-code-poc". Paste that JavaScript content into your index.js file and save it.

0.5. Create CloudFormation Templates (IaC)

These YAML files define your AWS infrastructure. Create them inside s3-presigned-url-poc/aws-infrastructure/cloudformation/.

s3-poc-bucket.yaml: Defines your S3 bucket for testing.

Important: You'll need to choose a globally unique name for the PoCBucketName parameter when deploying (e.g., my-presigned-url-poc-bucket-yourname-123).

AWSTemplateFormatVersion: '2010-09-09'
Description: S3 Bucket for Presigned URL PoC Testing

Parameters:
  PoCBucketName:
    Type: String
    Description: Name for the S3 bucket to use for PoC testing. Must be globally unique.

Resources:
  PoCBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref PoCBucketName
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      Tags:
        - Key: Project
          Value: S3PresignedUrlPoC

Outputs:
  PoCBucketNameOutput:
    Description: Name of the PoC S3 Bucket.
    Value: !Ref PoCBucketName
    Export:
      Name: !Sub "${AWS::StackName}-PoCBucketName"

lambda-role-poc.yaml: IAM Role for the Lambda function.

AWSTemplateFormatVersion: '2010-09-09'
Description: IAM Role for S3 Presigned URL PoC Lambda Function

Parameters:
  PoCBucketName:
    Type: String
    Description: Name of the S3 PoC bucket the Lambda function needs access to.

Resources:
  PoCLambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole # Allows logging to CloudWatch
      Policies:
        - PolicyName: S3PoCPresignedUrlAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - s3:GetObject
                  - s3:PutObject
                Resource:
                  - !Sub "arn:aws:s3:::${PoCBucketName}"
                  - !Sub "arn:aws:s3:::${PoCBucketName}/*" # All objects in the PoC bucket
      Tags:
        - Key: Project
          Value: S3PresignedUrlPoC

Outputs:
  PoCLambdaRoleArn:
    Description: ARN of the PoC Lambda Execution Role.
    Value: !GetAtt PoCLambdaExecutionRole.Arn
    Export:
      Name: !Sub "${AWS::StackName}-PoCLambdaRoleArn"

lambda-function-poc.yaml: The Lambda function definition.

Crucial: You'll need to create a separate S3 bucket to store your zipped Lambda code (S3PresignedUrlGenerator.zip) and update the LambdaCodeS3Bucket and LambdaCodeS3Key parameters in this template accordingly before deployment.

AWSTemplateFormatVersion: '2010-09-09'
Description: AWS Lambda Function for S3 Presigned URL PoC Generation

Parameters:
  PoCLambdaRoleArn:
    Type: String
    Description: ARN of the PoC Lambda function.
  PoCBucketName:
    Type: String
    Description: Name of the PoC S3 bucket the Lambda function will interact with (for environment variable).
  LambdaCodeS3Bucket:
    Type: String
    Description: S3 bucket where the Lambda deployment package (zip file) is located.
  LambdaCodeS3Key:
    Type: String
    Description: S3 key (path/filename) of the Lambda deployment package (zip file).

Resources:
  PoCS3PresignedUrlGenerator:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: PoCS3PresignedUrlGenerator # Unique function name for PoC
      Handler: index.handler
      Runtime: nodejs20.x
      Role: !Ref PoCLambdaRoleArn
      Timeout: 30 # seconds
      MemorySize: 128 # MB
      Code:
        S3Bucket: !Ref LambdaCodeS3Bucket # S3 bucket for your zipped Lambda code
        S3Key: !Ref LambdaCodeS3Key # S3 key (path/filename) of your zipped Lambda code
      Environment:
        Variables:
          S3_BUCKET_NAME: !Ref PoCBucketName
      Tags:
        - Key: Project
          Value: S3PresignedUrlPoC

Outputs:
  PoCLambdaFunctionArn:
    Description: ARN of the PoC Lambda function.
    Value: !GetAtt PoCS3PresignedUrlGenerator.Arn
    Export:
      Name: !Sub "${AWS::StackName}-PoCLambdaFunctionArn"

api-gateway-poc.yaml: The API Gateway endpoint definition.

AWSTemplateFormatVersion: '2010-09-09'
Description: AWS API Gateway for S3 Presigned URL PoC Lambda Function

Parameters:
  PoCLambdaFunctionArn:
    Type: String
    Description: ARN of the PoC Lambda function to integrate with.

Resources:
  PoCApiGatewayRestApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: PoCS3PresignedUrlApi # Unique API name for PoC
      Description: API for generating S3 presigned URLs for PoC.
      EndpointConfiguration:
        Types:
          - REGIONAL

  PoCApiGatewayResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      ParentId: !GetAtt PoCApiGatewayRestApi.RootResourceId
      PathPart: presigned-url
      RestApiId: !Ref PoCApiGatewayRestApi

  PoCApiGatewayMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      HttpMethod: GET
      ResourceId: !Ref PoCApiGatewayResource
      RestApiId: !Ref PoCApiGatewayRestApi
      AuthorizationType: NONE # No authorization for simple PoC
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${PoCLambdaFunctionArn}/invocations"
      RequestParameters:
        method.request.querystring.key: true
        method.request.querystring.action: false # Optional action
        method.request.querystring.contentType: false # Optional contentType

  PoCLambdaPermission:
    Type: AWS::Lambda::Permission
    Properties:
      Action: lambda:InvokeFunction
      FunctionName: !Ref PoCLambdaFunctionArn
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${PoCApiGatewayRestApi.RestApiId}/*/*"

  PoCApiGatewayDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn: PoCApiGatewayMethod
    Properties:
      RestApiId: !Ref PoCApiGatewayRestApi
      Description: Initial PoC deployment.

  PoCApiGatewayStage:
    Type: AWS::ApiGateway::Stage
    Properties:
      StageName: poc # PoC stage name
      RestApiId: !Ref PoCApiGatewayRestApi
      DeploymentId: !Ref PoCApiGatewayDeployment

  # CORS for PoC (allow all origins for easy testing)
  PoCApiGatewayCorsMethodOptions:
    Type: AWS::ApiGateway::Method
    Properties:
      HttpMethod: OPTIONS
      ResourceId: !Ref PoCApiGatewayResource
      RestApiId: !Ref PoCApiGatewayRestApi
      AuthorizationType: NONE
      Integration:
        Type: MOCK
        RequestTemplates:
          application/json: "{\"statusCode\": 200}"
        IntegrationResponses:
          - StatusCode: 200
            ResponseParameters:
              method.response.header.Access-Control-Allow-Headers: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,content-type'"
              method.response.header.Access-Control-Allow-Methods: "'GET,PUT,OPTIONS'"
              method.response.header.Access-Control-Allow-Origin: "'*'" # Allowing all origins for simple PoC
            ResponseTemplates:
              application/json: "null"
            SelectionPattern: ""
      MethodResponses:
        - StatusCode: 200
          ResponseParameters:
            method.response.header.Access-Control-Allow-Headers: true
            method.response.header.Access-Control-Allow-Methods: true
            method.response.header.Access-Control-Allow-Origin: true

Outputs:
  PoCApiGatewayInvokeUrl:
    Description: Invoke URL of the PoC API Gateway endpoint.
    Value: !Sub "https://${PoCApiGatewayRestApi.RestApiId}.execute-api.${AWS::Region}.amazonaws.com/${PoCApiGatewayStage.StageName}"
    Export:
      Name: !Sub "${AWS::StackName}-PoCApiGatewayInvokeUrl"


**0.6. Create `.gitignore` (Optional but Recommended)**

This file tells Git which files or folders to ignore (e.g., temporary files, sensitive data) so they don't get accidentally committed to your repository.

1.  Create a file named `.gitignore` directly inside your `s3-presigned-url-poc/` directory.

2.  Add the following content:

    ```
    # Node.js
    node_modules/
    .env

    # Zip files (for Lambda deployment)
    *.zip

    # AWS CLI cache/temp files
    .aws/

    # OS generated files
    .DS_Store
    Thumbs.db
    ```

3.  Save the file.
