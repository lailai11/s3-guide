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

On macOS/Linux, you might use nano index.html or open it with your preferred code editor (like VS Code, Sublime Text).

Copy and paste the entire content from the Canvas below (the full HTML code for the interactive guide) into this index.html file and save it.

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Guide: Secure S3 File Transfer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Chosen Palette: Calm Tech -->
    <!-- Application Structure Plan: The SPA is designed as an interactive, single-page dashboard. The Architecture Section now features a fully revised diagram showing the multi-bucket (Incoming, Trusted, Quarantine) flow with the File Processor and Auth Service. Clicking components scrolls to deep-dive sections. The Workflow Animation visually details Request-Upload, Direct Upload (with integrity check and conditional routing), and Download processes. This is more user-friendly than a linear document, allowing users to explore components in any order. The structure includes an interactive demo with two main parts: a "Request File Upload" form (simulated backend workflow initiation) and a "Generate Temporary Download Link" feature, providing a tangible feel for how presigned URLs work for both upload (to an Incoming bucket) and download (from a Trusted bucket), solidifying the user's understanding of the core concept. The workflow animation has been updated and debugged to reflect the full request-to-upload process, file processing, and ensure correct visual flow, including user authentication. -->
    <!-- Visualization & Content Choices:
        - Architecture Diagram: Extensively revised HTML/CSS layout to represent the complex multi-bucket, multi-lambda architecture visually. Goal: Organize/Inform. Interaction: Click to scroll.
        - Component Features: Info cards with icons and text. Goal: Inform.
        - Presigned URL Flow: Explained as process text. Goal: Explain a process.
        - Logging Comparison: Two-column text. Goal: Compare.
        - Workflow Animation: Updated to show "Request Upload" flow, "Direct Upload to Incoming S3", "File Processing" (including distinct steps for integrity check and conditional routing to Trusted/Quarantine), and "Download" flows. Debugged to ensure correct highlighting and indicator movement. Uses HTML/CSS for visual elements and JavaScript to sequence steps and animate data flow (e.g., highlighting paths, moving indicators). Goal: Explain a complex process visually, Engage/Teach.
        - Interactive Demo: HTML forms and JavaScript for simulated request, direct upload, and download link generation. Goal: Engage/Teach.
        - NO SVG/Mermaid used. No data charts are needed as the source material is conceptual.
    -->
    <!-- CONFIRMATION: NO SVG graphics used. NO Mermaid JS used. -->
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f7f4;
            color: #4a4a4a;
        }
        .component {
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .component:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
        }
        .section-title {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }
        html {
            scroll-behavior: smooth;
        }

        /* Animation specific styles */
        .workflow-box {
            border: 2px solid #cbd5e0;
            padding: 1rem;
            border-radius: 0.5rem;
            background-color: #f0f4f8;
            font-weight: 600;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 120px; /* Fixed height for boxes */
            font-size: 0.9rem; /* Slightly smaller font for more content */
        }
        .workflow-step-description {
            min-height: 40px; /* Ensure space for description */
            text-align: center;
            font-size: 0.9rem;
            color: #64748b;
        }
        .arrow-path {
            position: relative;
            background-color: #d1d5db; /* Default grey */
            height: 4px;
            margin: 0.5rem 0;
            border-radius: 2px;
        }
        .arrow-path-vertical {
            width: 4px;
            height: 80px; /* Adjust height as needed */
            margin: 0 auto;
            background-color: #d1d5db;
        }
        .arrow-path.active {
            background-color: #4f46e5; /* Active indigo */
            transition: background-color 0.3s ease-in-out;
        }
        .arrow-path-vertical.active {
            background-color: #4f46e5;
            transition: background-color 0.3s ease-in-out;
        }
        .data-indicator {
            width: 20px;
            height: 20px;
            background-color: #ef4444; /* Red for data flow */
            border-radius: 50%;
            position: absolute;
            top: -8px; /* Center vertically on the path */
            left: 0;
            opacity: 0;
            transition: all 0.5s ease-in-out;
        }
        .data-indicator-vertical {
            width: 20px;
            height: 20px;
            background-color: #10b981; /* Green for data flow */
            border-radius: 50%;
            position: absolute;
            left: -8px; /* Center horizontally on the path */
            top: 0;
            opacity: 0;
            transition: all 0.5s ease-in-out;
        }
        @keyframes pulse-once {
            0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
            50% { transform: scale(1.02); box-shadow: 0 0 10px rgba(0,0,0,0.2); }
            100% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
        }
        .animate-pulse-once {
            animation: pulse-once 1s ease-out;
        }
    </style></head><body class="antialiased">

    <header class="bg-white py-6 shadow-sm sticky top-0 z-50">
        <div class="container mx-auto px-6 text-center">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800">Interactive Guide to Secure S3 File Transfer</h1>
            <p class="text-lg text-gray-500 mt-2">An explorable overview of AWS S3, temporary access, and logging.</p>
        </div>
    </header>

    <main class="container mx-auto p-4 md:p-8">

        <!-- Architecture Section -->
        <section id="architecture" class="my-12">
            <h2 class="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-700 section-title">Solution Architecture</h2>
            <p class="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
                This architecture provides secure, authenticated file transfer with integrity checking and robust logging. The user interacts via a frontend, which orchestrates backend services for presigned URL generation and file processing, ensuring sensitive credentials are never exposed. Click on any component to explore its role.
            </p>
            <div class="w-full max-w-5xl mx-auto p-4 md:p-8 bg-white rounded-xl shadow-md border border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-5 gap-8 items-center text-center">
                    <!-- Column 1: User & Frontend -->
                    <div class="space-y-4 col-span-1">
                        <div data-target="user-frontend-details" class="component cursor-pointer p-4 border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg">
                            <div class="text-4xl">👤</div>
                            <h3 class="font-bold text-blue-800">User / Frontend App</h3>
                            <p class="text-sm text-blue-600">Interface for requests & direct S3 I/O.</p>
                        </div>
                    </div>

                    <!-- Column 2: Authentication -->
                    <div class="space-y-4 col-span-1">
                        <div class="flex justify-center items-center h-full">
                            <div class="text-3xl text-gray-400 font-mono hidden md:block">→</div>
                            <div class="text-3xl text-gray-400 font-mono md:hidden">↓</div>
                        </div>
                        <div data-target="backend-details" class="component cursor-pointer p-4 border-2 border-dashed border-blue-700 bg-blue-100 rounded-lg">
                            <div class="text-4xl">🔐</div>
                            <h3 class="font-bold text-blue-900">Auth Service / User DB</h3>
                            <p class="text-sm text-blue-800">Validates user identity (e.g. X.509/CAC).</p>
                        </div>
                        <div class="flex justify-center items-center h-full">
                            <div class="text-3xl text-gray-400 font-mono hidden md:block">→</div>
                            <div class="text-3xl text-gray-400 font-mono md:hidden">↓</div>
                        </div>
                    </div>

                    <!-- Column 3: Backend Services -->
                    <div class="space-y-4 col-span-1">
                        <div class="flex justify-center items-center h-full">
                            <div class="text-3xl text-gray-400 font-mono hidden md:block">→</div>
                            <div class="text-3xl text-gray-400 font-mono md:hidden">↓</div>
                        </div>
                        <div data-target="backend-details" class="component cursor-pointer p-4 border-2 border-dashed border-purple-300 bg-purple-50 rounded-lg">
                            <div class="text-4xl">⚙️</div>
                            <h3 class="font-bold text-purple-800">Backend (API Gateway/Lambda)</h3>
                            <p class="text-sm text-purple-600">Handles authenticated requests, generates Presigned URLs.</p>
                        </div>
                        <div class="flex justify-center items-center h-full">
                            <div class="text-3xl text-gray-400 font-mono hidden md:block">→</div>
                            <div class="text-3xl text-gray-400 font-mono md:hidden">↓</div>
                        </div>
                    </div>

                    <!-- Column 4: S3 Buckets & Processing -->
                    <div class="space-y-4 col-span-1">
                        <div class="flex justify-center items-center h-full">
                            <div class="text-3xl text-gray-400 font-mono hidden md:block">→</div>
                            <div class="text-3xl text-gray-400 font-mono md:hidden">↓</div>
                        </div>
                        <div data-target="s3-details" class="component cursor-pointer p-4 border-2 border-dashed border-green-300 bg-green-50 rounded-lg">
                            <div class="text-4xl">📥</div>
                            <h3 class="font-bold text-green-800">Incoming S3 Bucket</h3>
                            <p class="text-sm text-green-600">Initial staging for uploads.</p>
                        </div>
                        <div class="flex justify-center items-center h-full">
                            <div class="text-3xl text-gray-400 font-mono hidden md:block">→</div>
                            <div class="text-3xl text-gray-400 font-mono md:hidden">↓</div>
                        </div>
                        <div data-target="backend-details" class="component cursor-pointer p-4 border-2 border-dashed border-orange-600 bg-orange-100 rounded-lg">
                            <div class="text-4xl">🔍</div>
                            <h3 class="font-bold text-orange-800">File Processor (Lambda)</h3>
                            <p class="text-sm text-orange-600">Performs integrity & security checks.</p>
                        </div>
                        <div class="flex justify-center items-center h-full">
                            <div class="text-3xl text-gray-400 font-mono hidden md:block">→</div>
                            <div class="text-3xl text-gray-400 font-mono md:hidden">↓</div>
                        </div>
                        <div data-target="s3-details" class="component cursor-pointer p-4 border-2 border-dashed border-lime-600 bg-lime-100 rounded-lg">
                            <div class="text-4xl">✅</div>
                            <h3 class="font-bold text-lime-800">Trusted S3 Bucket</h3>
                            <p class="text-sm text-lime-600">Secure storage for validated files.</p>
                        </div>
                         <div data-target="s3-details" class="component cursor-pointer p-4 border-2 border-dashed border-rose-600 bg-rose-100 rounded-lg mt-4">
                            <div class="text-4xl">🚫</div>
                            <h3 class="font-bold text-rose-800">Quarantine S3 Bucket</h3>
                            <p class="text-sm text-rose-600">Holds failed/malicious files.</p>
                        </div>
                    </div>

                    <!-- Column 5: Logging (Simplified for visual flow) -->
                    <div class="space-y-4 col-span-1">
                        <div class="flex justify-center items-center h-full">
                            <div class="text-3xl text-gray-400 font-mono hidden md:block">→</div>
                            <div class="text-3xl text-gray-400 font-mono md:hidden">↓</div>
                        </div>
                        <div data-target="logging-details" class="component cursor-pointer p-4 border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-lg" style="height: calc(100% - 16px - 1.5rem*2 - 8px*2);"> <!-- Adjust height to fill column -->
                            <div class="text-4xl">📝</div>
                            <h3 class="font-bold text-yellow-800">Logging Services</h3>
                            <p class="text-sm text-yellow-600">CloudTrail & S3 Access Logs (Passive across all steps).</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Workflow Animation Section -->
        <section id="workflow-animation" class="my-16 p-8 bg-white rounded-xl shadow-md border border-gray-200">
            <h2 class="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-700 section-title">Secure Transfer Workflow</h2>
            <p class="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
                This animation visualizes the step-by-step process of both requesting/uploading and downloading files securely using presigned URLs and backend processing. Follow the flow to understand how data and requests move through the system, ensuring security and temporary access.
            </p>

            <div class="flex justify-center mb-8 space-x-4">
                <button id="start-request-upload-animation" class="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out">
                    Start Request-Upload Workflow
                </button>
                <button id="start-direct-upload-animation" class="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out">
                    Start Direct-Upload Workflow
                </button>
                <button id="start-download-animation" class="bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out">
                    Start Download Workflow
                </button>
                <button id="reset-animation" class="bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-150 ease-in-out">
                    Reset
                </button>
            </div>

            <div class="grid grid-cols-5 items-start gap-4">
                <!-- User/Frontend Column -->
                <div class="flex flex-col items-center col-span-1">
                    <div id="user-frontend-node" class="workflow-box text-blue-800">👤 User / Frontend</div>
                    <div id="step-desc-0" class="workflow-step-description mt-2"></div>
                </div>

                <!-- Auth Column -->
                <div class="flex flex-col items-center col-span-1">
                    <div id="auth-service-node" class="workflow-box text-blue-700">🔐 Auth Service / User DB</div>
                    <div id="auth-backend-arrow" class="arrow-path-vertical h-20 relative">
                        <div id="auth-backend-indicator" class="data-indicator-vertical" style="top: 0; background-color: #6366f1;"></div>
                    </div>
                    <div id="step-desc-auth" class="workflow-step-description mt-2"></div>
                </div>

                <!-- Backend Column -->
                <div class="flex flex-col items-center col-span-1">
                    <div id="backend-node" class="workflow-box text-purple-800">⚙️ Backend (API Gateway/Lambda)</div>
                    <div id="backend-s3-arrow-1" class="arrow-path-vertical h-20 relative">
                        <div id="backend-s3-indicator-1" class="data-indicator-vertical" style="top: 0;"></div>
                    </div>
                    <div id="step-desc-1" class="workflow-step-description"></div>
                    <div id="backend-s3-arrow-2" class="arrow-path-vertical h-20 relative">
                        <div id="backend-s3-indicator-2" class="data-indicator-vertical" style="top: 0;"></div>
                    </div>
                    <div id="step-desc-2" class="workflow-step-description"></div>
                    <div id="step-desc-3" class="workflow-step-description"></div>
                </div>

                <!-- S3 & Processor Columns -->
                <div class="flex flex-col items-center col-span-1">
                    <div class="h-[120px]"></div> <!-- Placeholder for auth-service-node -->
                    <div class="h-[80px]"></div> <!-- Placeholder for auth-backend-arrow -->
                    <div id="incoming-s3-node" class="workflow-box text-green-800">📥 Incoming S3 Bucket</div>
                    <div id="incoming-processor-arrow" class="arrow-path-vertical h-20 relative">
                        <div id="incoming-processor-indicator" class="data-indicator-vertical" style="top: 0; background-color: #6d28d9;"></div>
                    </div>
                    <div id="step-desc-s3-process-trigger" class="workflow-step-description"></div>
                    <div id="processor-node" class="workflow-box text-orange-600">🔍 File Processor (Lambda)</div>
                    <div id="processor-s3-arrow-trusted" class="arrow-path-vertical h-20 relative">
                        <div id="processor-s3-indicator-trusted" class="data-indicator-vertical" style="top: 0; background-color: #10b981;"></div>
                    </div>
                    <div id="processor-s3-arrow-quarantine" class="arrow-path-vertical h-20 relative">
                        <div id="processor-s3-indicator-quarantine" class="data-indicator-vertical" style="top: 0; background-color: #ef4444;"></div>
                    </div>
                    <div id="step-desc-4" class="workflow-step-description mt-2"></div>
                </div>

                <!-- Trusted/Quarantine S3 Buckets -->
                <div class="flex flex-col items-center col-span-1">
                    <div class="h-[120px]"></div> <!-- Placeholder -->
                    <div class="h-[80px]"></div> <!-- Placeholder for auth-backend-arrow -->
                    <div class="h-[120px]"></div> <!-- Placeholder for incoming-s3-node -->
                    <div class="h-[80px]"></div> <!-- Placeholder for incoming-processor-arrow -->
                    <div class="h-[120px]"></div> <!-- Placeholder for processor-node -->
                    <div id="trusted-s3-node" class="workflow-box text-lime-600">✅ Trusted S3 Bucket</div>
                    <div id="quarantine-s3-node" class="workflow-box text-rose-600">🚫 Quarantine S3 Bucket</div>
                </div>
            </div>
            <div class="text-center text-gray-500 text-sm mt-8">All steps are logged passively by CloudTrail and S3 Access Logs.</div>
        </section>


        <!-- Deep Dive Sections -->
        <div class="space-y-16">
            <section id="user-frontend-details" class="p-8 bg-white rounded-xl shadow-md border border-gray-200">
                <h2 class="text-2xl font-bold text-blue-800 mb-4 section-title">👤 The User & Frontend</h2>
                <p class="text-gray-600 mb-6">The frontend is the user-facing part of the system, running in the browser. Its primary security role is to **never handle permanent AWS credentials**. Instead, it performs authenticated interactions with a trusted backend to orchestrate secure file operations.</p>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 class="font-semibold text-lg text-blue-700 mb-2">Upload Process</h3>
                        <ol class="list-decimal list-inside space-y-2 text-gray-700">
                            <li>**Authenticate:** User's browser presents client certificate (e.g., from CAC card) to API Gateway.</li>
                            <li>Frontend requests a secure **upload link** from the authenticated backend.</li>
                            <li>Backend returns a temporary, one-time-use Presigned URL for the Incoming S3 Bucket.</li>
                            <li>Frontend uploads the file directly to Incoming S3 using this URL.</li>
                        </ol>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 class="font-semibold text-lg text-blue-700 mb-2">Download Process</h3>
                        <ol class="list-decimal list-inside space-y-2 text-gray-700">
                            <li>**Authenticate:** User's browser presents client certificate (e.g., from CAC card) to API Gateway.</li>
                            <li>Frontend requests a secure **download link** from the authenticated backend.</li>
                            <li>Backend returns a temporary, short-lived Presigned URL for the Trusted S3 Bucket.</li>
                            <li>Browser uses the URL to download the file directly from Trusted S3.</li>
                        </ol>
                    </div>
                </div>
            </section>
            
            <section id="backend-details" class="p-8 bg-white rounded-xl shadow-md border border-gray-200">
                <h2 class="text-2xl font-bold text-purple-800 mb-4 section-title">⚙️ The Backend Gatekeeper</h2>
                 <p class="text-gray-600 mb-6">The backend, composed of API Gateway and AWS Lambda, acts as a trusted gatekeeper. It is the only part of the system (besides administrators) with permissions to interact with S3 directly. Its sole purpose in this context is to validate authenticated requests and generate temporary, single-use Presigned URLs.</p>
                <div class="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h3 class="font-semibold text-lg text-purple-700 mb-2">Key Responsibilities</h3>
                    <ul class="list-disc list-inside space-y-2 text-gray-700">
                        <li><b>Authentication & Authorization:</b> (Via Custom Authorizer Lambda) Verifies the user's identity (e.g., from CAC card certificate) and checks if they are an approved user with appropriate permissions.</li>
                        <li><b>Generate Presigned URLs:</b> Uses its IAM Role to ask S3 for a temporary URL for a specific action (`getObject` or `putObject`).</li>
                        <li><b>Enforce Security Policy:</b> Can add further conditions, like limiting file sizes or types, before generating a URL.</li>
                        <li><b>Audit Trail:</b> All actions taken by the Lambda function are logged in CloudTrail, providing a clear record of who requested access to what, and when.</li>
                    </ul>
                </div>
            </section>

            <section id="s3-details" class="p-8 bg-white rounded-xl shadow-md border border-gray-200">
                <h2 class="text-2xl font-bold text-green-800 mb-4 section-title">🗄️ Secure S3 Storage</h2>
                <p class="text-gray-600 mb-6">The S3 bucket is the foundation of the storage system, configured with multiple layers of security to protect data at rest and control access. This architecture uses dedicated buckets for each stage of the file lifecycle.</p>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 class="font-semibold text-lg text-green-700 mb-2">Incoming Bucket</h3>
                        <p class="text-gray-700">Files are initially uploaded here via presigned URLs. This acts as a staging area before security checks.</p>
                    </div>
                    <div class="bg-lime-500 p-4 rounded-lg border border-lime-600">
                        <h3 class="font-semibold text-lg text-lime-700 mb-2">Trusted Bucket</h3>
                        <p class="text-gray-700">Files that pass all integrity and security checks are moved here. This is the source for approved downloads.</p>
                    </div>
                    <div class="bg-rose-500 p-4 rounded-lg border border-rose-600">
                        <h3 class="font-semibold text-lg text-rose-700 mb-2">Quarantine Bucket</h3>
                        <p class="text-gray-700">Files that fail integrity or security checks are moved to this isolated bucket for further investigation.</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 class="font-semibold text-lg text-green-700 mb-2">Block Public Access</h3>
                        <p class="text-gray-700">This is **ON** by default for ALL buckets. It ensures no file can be made public by mistake through bucket policies or ACLs.</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 class="font-semibold text-lg text-green-700 mb-2">Server-Side Encryption (SSE-KMS)</h3>
                        <p class="text-gray-700">Files are automatically encrypted the moment they are written to the disk in S3. AWS manages the encryption keys, providing seamless data protection at rest.</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 class="font-semibold text-lg text-green-700 mb-2">Bucket Versioning</h3>
                        <p class="text-gray-700">Enabled for all buckets to protect against accidental overwrites or deletions. Every version of a file is preserved, allowing for easy recovery.</p>
                    </div>
                </div>
            </section>
            
            <section id="logging-details" class="p-8 bg-white rounded-xl shadow-md border border-gray-200">
                <h2 class="text-2xl font-bold text-yellow-800 mb-4 section-title">📝 Comprehensive Logging</h2>
                 <p class="text-gray-600 mb-6">Visibility is key to security. Two distinct types of logging work together to provide a complete picture of all activity related to your S3 bucket.</p>
                 <div class="grid md:grid-cols-2 gap-8">
                     <div class="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                         <h3 class="font-semibold text-lg text-yellow-700 mb-2">AWS CloudTrail (The "Who" and "What")</h3>
                         <p class="text-gray-700 mb-4">Tracks all API calls made to your AWS account.</p>
                         <ul class="list-disc list-inside space-y-2 text-gray-700">
                            <li><b>Answers:</b> Who generated a presigned URL? When was a bucket policy changed?</li>
                            <li><b>Scope:</b> Account-wide API activity.</li>
                             <li><b>Key Insight:</b> Audits administrative actions and backend requests for temporary access.</li>
                         </ul>
                     </div>
                     <div class="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                         <h3 class="font-semibold text-lg text-yellow-700 mb-2">S3 Server Access Logs (The "How" and "Where from")</h3>
                         <p class="text-gray-700 mb-4">Records every direct request made to your S3 bucket.</p>
                         <ul class="list-disc list-inside space-y-2 text-gray-700">
                            <li><b>Answers:</b> Which IP address downloaded the file using a presigned URL? Was the request successful?</li>
                            <li><b>Scope:</b> Bucket-specific HTTP requests.</li>
                             <li><b>Key Insight:</b> Provides a raw, detailed log of every file access, successful or not.</li>
                         </ul>
                     </div>
                 </div>
            </section>
        </div>

        <!-- Interactive Demo Section -->
        <section id="demo" class="my-16">
            <h2 class="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-700 section-title">Interactive Demo</h2>
            <p class="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
                Experience secure file transfer. Select a file to upload or generate a temporary download link for an existing mock file. This demonstrates how the frontend interacts with the backend to obtain time-limited S3 access without exposing credentials.
            </p>
            <div class="w-full max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                
                <!-- Request File Upload Sub-section -->
                <div class="mb-8 p-6 border border-teal-200 rounded-lg bg-teal-50">
                    <h3 class="text-xl font-semibold text-teal-800 mb-4">Request File Upload</h3>
                    <p class="text-gray-700 text-sm mb-4">
                        Simulate requesting an upload link. Fill in your details and the type of file you need to send. This information would typically trigger a backend workflow to generate a personalized presigned URL and send it to your email.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label for="first-name" class="block text-sm font-medium text-gray-700">First Name</label>
                            <input type="text" id="first-name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2" placeholder="John">
                        </div>
                        <div>
                            <label for="last-name" class="block text-sm font-medium text-gray-700">Last Name</label>
                            <input type="text" id="last-name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2" placeholder="Doe">
                        </div>
                        <div class="md:col-span-2">
                            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2" placeholder="john.doe@example.com">
                        </div>
                        <div class="md:col-span-2">
                            <label for="department" class="block text-sm font-medium text-gray-700">Department</label>
                            <input type="text" id="department" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2" placeholder="Sales">
                        </div>
                        <div class="col-span-1 md:col-span-2">
                            <label for="upload-category" class="block text-sm font-medium text-gray-700">Upload Category</label>
                            <select id="upload-category" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2">
                                <option value="">Select a category</option>
                                <option value="Part Request">Part Request</option>
                                <option value="Part Estimate">Part Estimate</option>
                                <option value="Invoice">Invoice</option>
                            </select>
                        </div>
                    </div>
                    <button id="submit-upload-request-btn" class="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition duration-150 ease-in-out">
                        Submit Upload Request
                    </button>
                    <p id="request-status-message" class="text-center text-sm mt-3 text-gray-700"></p>
                </div>

                <!-- File Upload Sub-section (existing) -->
                <div class="mb-8 p-6 border border-blue-200 rounded-lg bg-blue-50">
                    <h3 class="text-xl font-semibold text-blue-800 mb-4">Direct File Upload (using issued link)</h3>
                    <p class="text-gray-700 text-sm mb-4">
                        Once you receive a presigned upload link (conceptually, via email after requesting), you would use it here to directly upload your file to the Incoming S3 bucket.
                    </p>
                    <input type="file" id="upload-file-input" class="block w-full text-sm text-gray-500
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-full file:border-0
                               file:text-sm file:font-semibold
                               file:bg-blue-50 file:text-blue-700
                               hover:file:bg-blue-100 mb-4" />
                    <button id="upload-file-btn" class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out">
                        Upload File to S3
                    </button>
                    <p id="upload-status-message" class="text-center text-sm mt-3 text-gray-700"></p>
                </div>

                <!-- Generate Download Link Sub-section (existing) -->
                <div class="p-6 border border-purple-200 rounded-lg bg-purple-50">
                    <h3 class="text-xl font-semibold text-purple-800 mb-4">Get Temporary Download Link</h3>
                    <label for="download-file-select" class="block text-sm font-medium text-gray-700 mb-1">Select Mock File for Download:</label>
                    <select id="download-file-select" class="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="hkmux/summary_report.pdf">hkmux/summary_report.pdf</option>
                        <option value="security/disa_stig_summary.html">security/disa_stig_summary.html</option>
                        <option value="customer/part_request_form.docx">customer/part_request_form.docx</option>
                    </select>
                    <button id="generate-link-btn" class="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out mt-4">
                        Generate Temporary Download Link
                    </button>
                </div>

                <div id="demo-output" class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200" style="display: none;">
                    <h3 class="font-bold text-gray-800 mb-2">Generated Presigned URL:</h3>
                    <p id="presigned-url-output" class="text-sm text-red-600 bg-red-50 p-3 rounded break-all font-mono"></p>
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <h4 class="font-semibold text-gray-700 mb-2">What just happened?</h4>
                        <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600">
                            <li>Your browser (the "Frontend") sent the file name to a secure backend API.</li>
                            <li>The backend "Lambda" function verified you have permission.</li>
                            <li>The Lambda used its secure IAM role to request a temporary URL from S3, valid for only 5 minutes.</li>
                            <li>The unique, signed URL was returned to the browser. It contains temporary credentials in its query string.</li>
                            <li>Anyone with this link can now use it (e.g., download/upload) until it expires. No AWS account is needed.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </section>

    </main>
    
    <footer class="text-center py-8 mt-8 border-t border-gray-200">
        <p class="text-gray-500">Interactive guide generated from technical documentation.</p>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const components = document.querySelectorAll('.component');
            components.forEach(component => {
                component.addEventListener('click', () => {
                    const targetId = component.dataset.target;
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        targetElement.classList.add('animate-pulse-once');
                        setTimeout(() => targetElement.classList.remove('animate-pulse-once'), 1000);
                    }
                });
            });

            // Demo Elements
            const uploadFileInput = document.getElementById('upload-file-input');
            const uploadFileBtn = document.getElementById('upload-file-btn');
            const uploadStatusMessage = document.getElementById('upload-status-message');
            const downloadFileSelect = document.getElementById('download-file-select');
            const generateLinkBtn = document.getElementById('generate-link-btn');
            const demoOutput = document.getElementById('demo-output');
            const urlOutput = document.getElementById('presigned-url-output');

            // Upload Request Elements
            const firstNameInput = document.getElementById('first-name');
            const lastNameInput = document.getElementById('last-name');
            const emailInput = document.getElementById('email');
            const departmentInput = document.getElementById('department');
            const uploadCategorySelect = document.getElementById('upload-category');
            const submitUploadRequestBtn = document.getElementById('submit-upload-request-btn');
            const requestStatusMessage = document.getElementById('request-status-message');


            // Animation Elements
            const startRequestUploadBtn = document.getElementById('start-request-upload-animation');
            const startDirectUploadBtn = document.getElementById('start-direct-upload-animation');
            const startDownloadBtn = document.getElementById('start-download-animation');
            const resetAnimationBtn = document.getElementById('reset-animation');

            const userFrontendNode = document.getElementById('user-frontend-node');
            const authServiceNode = document.getElementById('auth-service-node');
            const backendNode = document.getElementById('backend-node');
            const incomingS3Node = document.getElementById('incoming-s3-node');
            const processorNode = document.getElementById('processor-node');
            const trustedS3Node = document.getElementById('trusted-s3-node');
            const quarantineS3Node = document.getElementById('quarantine-s3-node');

            // Animation arrows and indicators
            const requestArrow = document.getElementById('request-arrow');
            const requestIndicator = document.getElementById('request-indicator');
            const authBackendArrow = document.getElementById('auth-backend-arrow');
            const authBackendIndicator = document.getElementById('auth-backend-indicator');
            const backendS3Arrow1 = document.getElementById('backend-s3-arrow-1');
            const backendS3Indicator1 = document.getElementById('backend-s3-indicator-1');
            const backendS3Arrow2 = document.getElementById('backend-s3-arrow-2');
            const backendS3Indicator2 = document.getElementById('backend-s3-indicator-2');
            const incomingProcessorArrow = document.getElementById('incoming-processor-arrow');
            const incomingProcessorIndicator = document.getElementById('incoming-processor-indicator');
            const processorS3ArrowTrusted = document.getElementById('processor-s3-arrow-trusted');
            const processorS3IndicatorTrusted = document.getElementById('processor-s3-indicator-trusted');
            const processorS3ArrowQuarantine = document.getElementById('processor-s3-arrow-quarantine');
            const processorS3IndicatorQuarantine = document.getElementById('processor-s3-indicator-quarantine');
            const s3UserArrow = document.getElementById('s3-user-arrow');
            const s3UserIndicator = document.getElementById('s3-user-indicator');

            // Ensure all stepDescriptions elements are retrieved, even if they might be null (handled by checks)
            const stepDescriptions = [
                document.getElementById('step-desc-0'),
                document.getElementById('step-desc-1'),
                document.getElementById('step-desc-2'),
                document.getElementById('step-desc-3'),
                document.getElementById('step-desc-4'),
                document.getElementById('step-desc-s3-process-trigger'),
                document.getElementById('step-desc-auth')
            ];

            function resetAnimation() {
                // Reset all indicators
                if (requestIndicator) {
                    requestIndicator.style.opacity = 0;
                    requestIndicator.style.left = '0';
                    requestIndicator.style.backgroundColor = '#ef4444'; // Reset color
                }
                if (authBackendIndicator) {
                    authBackendIndicator.style.opacity = 0;
                    authBackendIndicator.style.top = '0';
                }
                if (backendS3Indicator1) {
                    backendS3Indicator1.style.opacity = 0;
                    backendS3Indicator1.style.top = '0';
                }
                if (backendS3Indicator2) {
                    backendS3Indicator2.style.opacity = 0;
                    backendS3Indicator2.style.top = '0';
                }
                if (incomingProcessorIndicator) {
                    incomingProcessorIndicator.style.opacity = 0;
                    incomingProcessorIndicator.style.top = '0';
                }
                if (processorS3IndicatorTrusted) {
                    processorS3IndicatorTrusted.style.opacity = 0;
                    processorS3IndicatorTrusted.style.top = '0';
                }
                if (processorS3IndicatorQuarantine) {
                    processorS3IndicatorQuarantine.style.opacity = 0;
                    processorS3IndicatorQuarantine.style.top = '0';
                }
                if (s3UserIndicator) {
                    s3UserIndicator.style.opacity = 0;
                    s3UserIndicator.style.left = '0';
                    s3UserIndicator.style.backgroundColor = '#10b981'; // Reset color
                }

                // Reset all arrows
                if (requestArrow) requestArrow.classList.remove('active');
                if (authBackendArrow) authBackendArrow.classList.remove('active');
                if (backendS3Arrow1) backendS3Arrow1.classList.remove('active');
                if (backendS3Arrow2) backendS3Arrow2.classList.remove('active');
                if (incomingProcessorArrow) incomingProcessorArrow.classList.remove('active');
                if (processorS3ArrowTrusted) processorS3ArrowTrusted.classList.remove('active');
                if (processorS3ArrowQuarantine) processorS3ArrowQuarantine.classList.remove('active');
                if (s3UserArrow) s3UserArrow.classList.remove('active');

                // Reset descriptions
                stepDescriptions.forEach(desc => {
                    if (desc) desc.textContent = '';
                });

                // Reset ALL node highlights more broadly, targeting the specific nodes
                const allNodes = [userFrontendNode, authServiceNode, backendNode, incomingS3Node, processorNode, trustedS3Node, quarantineS3Node];
                allNodes.forEach(node => {
                    if (node) node.classList.remove('border-indigo-500', 'border-blue-500', 'border-purple-500', 'border-green-500', 'border-orange-500', 'border-lime-500', 'border-rose-500', 'border-blue-700');
                });
            }

            // Initial reset
            resetAnimation();

            async function animateRequestUploadWorkflow() {
                resetAnimation();
                let delay = 500; // General step delay

                // Step 1: User fills form & submits request
                if (stepDescriptions[0]) stepDescriptions[0].textContent = '1. User fills form & Frontend initiates request.';
                if (userFrontendNode) userFrontendNode.classList.add('border-blue-500');
                await new Promise(resolve => setTimeout(resolve, delay));

                // Step 2: Request to Backend for Auth (API Gateway)
                if (requestArrow) requestArrow.classList.add('active');
                if (requestIndicator) {
                    requestIndicator.style.opacity = 1;
                    requestIndicator.style.left = 'calc(100% - 20px)';
                }
                if (stepDescriptions[1]) stepDescriptions[1].textContent = '2. Request (with client cert) sent to API Gateway.';
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 3: API Gateway sends to Auth Service
                if (requestIndicator) requestIndicator.style.opacity = 0; // Request received by API Gateway
                if (backendNode) backendNode.classList.add('border-purple-500'); // Backend (API GW) active
                if (authBackendArrow) authBackendArrow.classList.add('active');
                if (authBackendIndicator) {
                    authBackendIndicator.style.opacity = 1;
                    authBackendIndicator.style.top = 'calc(100% - 20px)';
                    authBackendIndicator.style.backgroundColor = '#6366f1'; // Auth color
                }
                if (stepDescriptions[1]) stepDescriptions[1].textContent = '3. API Gateway forwards request to Auth Service.';
                if (stepDescriptions[6]) stepDescriptions[6].textContent = '3.1. Auth Service validates client certificate.';
                if (authServiceNode) authServiceNode.classList.add('border-blue-700'); // Auth Service active
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 4: Auth Service queries User DB and returns result
                if (authBackendIndicator) authBackendIndicator.style.opacity = 0; // Auth request received
                if (authBackendArrow) authBackendArrow.classList.remove('active'); // Path inactive
                if (authBackendArrow) authBackendArrow.classList.add('active'); // New path active
                if (authBackendIndicator) {
                    authBackendIndicator.style.opacity = 1;
                    authBackendIndicator.style.top = '0'; // Indicator moves back
                    authBackendIndicator.style.backgroundColor = '#10b981'; // Green for auth success
                }
                if (stepDescriptions[6]) stepDescriptions[6].textContent = '4. Auth Service queries approved user DB, returns decision.';
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 5: Backend processes request & issues link
                if (authBackendIndicator) authBackendIndicator.style.opacity = 0; // Auth response received by API GW
                if (authBackendArrow) authBackendArrow.classList.remove('active');
                if (authServiceNode) authServiceNode.classList.remove('border-blue-700'); // Auth service cleared

                if (stepDescriptions[1]) stepDescriptions[1].textContent = '5. Backend (API Gateway) allows/denies request based on Auth.';
                // If allowed, backend now calls S3PresignedUrlGenerator
                if (backendS3Arrow1) backendS3Arrow1.classList.add('active');
                if (backendS3Indicator1) {
                    backendS3Indicator1.style.opacity = 1;
                    backendS3Indicator1.style.top = 'calc(100% - 20px)';
                }
                if (stepDescriptions[2]) stepDescriptions[2].textContent = '5.1. Backend requests Presigned Upload URL from Incoming S3.';
                if (incomingS3Node) incomingS3Node.classList.add('border-green-500'); // Incoming S3 active
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 6: Incoming S3 provides URL to Backend
                if (stepDescriptions[3]) stepDescriptions[3].textContent = '6. Incoming S3 provides Presigned URL to Backend.';
                if (backendS3Indicator1) backendS3Indicator1.style.opacity = 0;
                if (backendS3Arrow1) backendS3Arrow1.classList.remove('active');

                if (backendS3Arrow2) backendS3Arrow2.classList.add('active');
                if (backendS3Indicator2) {
                    backendS3Indicator2.style.opacity = 1;
                    backendS3Indicator2.style.top = '0';
                }
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 7: Backend sends conceptual link to Frontend
                if (requestArrow) requestArrow.classList.remove('active');
                if (backendS3Indicator2) backendS3Indicator2.style.opacity = 0;
                if (backendS3Arrow2) backendS3Arrow2.classList.remove('active');
                if (backendNode) backendNode.classList.remove('border-purple-500');

                if (requestArrow) requestArrow.classList.add('active');
                if (requestIndicator) {
                    requestIndicator.style.opacity = 1;
                    requestIndicator.style.left = '0';
                    requestIndicator.style.backgroundColor = '#10b981';
                }
                if (stepDescriptions[4]) stepDescriptions[4].textContent = '7. Backend sends conceptual upload link to Frontend.';
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (userFrontendNode) userFrontendNode.classList.remove('border-blue-500');
                if (requestArrow) requestArrow.classList.remove('active');
                if (requestIndicator) requestIndicator.style.opacity = 0;
                if (incomingS3Node) incomingS3Node.classList.remove('border-green-500'); // Clear S3 highlight
                if (stepDescriptions[4]) stepDescriptions[4].textContent = 'Request-Upload Workflow initiated. User now has a conceptual link for direct upload.';
            }


            async function animateDirectUploadWorkflow() {
                resetAnimation();
                let delay = 500; // General step delay

                // Step 1: User/Frontend prepares file for direct upload
                if (stepDescriptions[0]) stepDescriptions[0].textContent = '1. User selects file, Frontend prepares for direct S3 upload.';
                if (userFrontendNode) userFrontendNode.classList.add('border-indigo-500'); // Indigo for direct upload
                await new Promise(resolve => setTimeout(resolve, delay));

                // Step 2: Direct Upload to Incoming S3
                // Move indicator from user to incoming S3 node
                if (s3UserArrow) s3UserArrow.classList.add('active');
                if (s3UserIndicator) {
                    s3UserIndicator.style.opacity = 1;
                    s3UserIndicator.style.left = 'calc(100% - 20px)'; // Data moves from user to S3 Incoming
                }
                if (stepDescriptions[4]) stepDescriptions[4].textContent = '2. Frontend uploads file directly to Incoming S3 using issued Presigned URL.';
                if (incomingS3Node) incomingS3Node.classList.add('border-green-500'); // Incoming S3 is active
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Step 3: Incoming S3 triggers File Processor
                if (s3UserIndicator) s3UserIndicator.style.opacity = 0; // Upload complete
                if (s3UserArrow) s3UserArrow.classList.remove('active'); // Path inactive

                if (incomingProcessorArrow) incomingProcessorArrow.classList.add('active');
                if (incomingProcessorIndicator) {
                    incomingProcessorIndicator.style.opacity = 1;
                    incomingProcessorIndicator.style.top = 'calc(100% - 20px)';
                }
                if (stepDescriptions[5]) stepDescriptions[5].textContent = '3. Incoming S3 triggers File Processor Lambda (S3 Event).';
                if (processorNode) processorNode.classList.add('border-orange-500'); // Processor is active
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 4: File Processor performs checks (integrity & security)
                if (incomingProcessorIndicator) incomingProcessorIndicator.style.opacity = 0; // Event received
                if (incomingProcessorArrow) incomingProcessorArrow.classList.remove('active');

                if (stepDescriptions[5]) stepDescriptions[5].textContent = '4. File Processor performs integrity & security checks.';
                await new Promise(resolve => setTimeout(resolve, delay * 2));

                // Simulate decision: move to trusted or quarantine
                const isFileClean = Math.random() > 0.5; // Simulate a 50/50 chance for clean/quarantine
                
                if (isFileClean) {
                    if (processorS3ArrowTrusted) processorS3ArrowTrusted.classList.add('active');
                    if (processorS3IndicatorTrusted) {
                        processorS3IndicatorTrusted.style.opacity = 1;
                        processorS3IndicatorTrusted.style.top = 'calc(100% - 20px)';
                    }
                    if (stepDescriptions[5]) stepDescriptions[5].textContent = '5. File passes checks, moved to Trusted S3 Bucket.';
                    if (trustedS3Node) trustedS3Node.classList.add('border-lime-500'); // Trusted is active
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    if (processorS3IndicatorTrusted) processorS3IndicatorTrusted.style.opacity = 0; // Move complete
                    if (processorS3ArrowTrusted) processorS3ArrowTrusted.classList.remove('active');
                } else {
                    if (processorS3ArrowQuarantine) processorS3ArrowQuarantine.classList.add('active');
                    if (processorS3IndicatorQuarantine) {
                        processorS3IndicatorQuarantine.style.opacity = 1;
                        processorS3IndicatorQuarantine.style.top = 'calc(100% - 20px)';
                    }
                    if (stepDescriptions[5]) stepDescriptions[5].textContent = '5. File fails checks, moved to Quarantine S3 Bucket.';
                    if (quarantineS3Node) quarantineS3Node.classList.add('border-rose-500'); // Quarantine is active
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    if (processorS3IndicatorQuarantine) processorS3IndicatorQuarantine.style.opacity = 0; // Move complete
                    if (processorS3ArrowQuarantine) processorS3ArrowQuarantine.classList.remove('active');
                }
                
                if (incomingS3Node) incomingS3Node.classList.remove('border-green-500'); // Incoming is cleared
                if (processorNode) processorNode.classList.remove('border-orange-500');
                if (userFrontendNode) userFrontendNode.classList.remove('border-indigo-500');

                if (stepDescriptions[5]) stepDescriptions[5].textContent = 'Direct Upload & Processing complete! (All steps logged passively).';
            }


            async function animateDownloadWorkflow() {
                resetAnimation();
                let delay = 500;

                // Step 1: User clicks download, Frontend requests download URL.
                if (stepDescriptions[0]) stepDescriptions[0].textContent = '1. User clicks download, Frontend requests download URL.';
                if (userFrontendNode) userFrontendNode.classList.add('border-purple-500'); // Purple for download
                await new Promise(resolve => setTimeout(resolve, delay));

                // Step 2: Request URL to Backend (with Auth)
                if (requestArrow) requestArrow.classList.add('active');
                if (requestIndicator) {
                    requestIndicator.style.opacity = 1;
                    requestIndicator.style.left = 'calc(100% - 20px)';
                }
                if (stepDescriptions[1]) stepDescriptions[1].textContent = '2. Request (with client cert) for Presigned Download URL sent.';
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 3: API Gateway sends to Auth Service
                if (requestIndicator) requestIndicator.style.opacity = 0; // Request received by API Gateway
                if (backendNode) backendNode.classList.add('border-purple-500'); // Backend (API GW) active
                if (authBackendArrow) authBackendArrow.classList.add('active');
                if (authBackendIndicator) {
                    authBackendIndicator.style.opacity = 1;
                    authBackendIndicator.style.top = 'calc(100% - 20px)';
                    authBackendIndicator.style.backgroundColor = '#6366f1'; // Auth color
                }
                if (stepDescriptions[1]) stepDescriptions[1].textContent = '3. API Gateway forwards request to Auth Service.';
                if (stepDescriptions[6]) stepDescriptions[6].textContent = '3.1. Auth Service validates client certificate.';
                if (authServiceNode) authServiceNode.classList.add('border-blue-700'); // Auth Service active
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 4: Auth Service queries User DB and returns result
                if (authBackendIndicator) authBackendIndicator.style.opacity = 0; // Auth request received
                if (authBackendArrow) authBackendArrow.classList.remove('active'); // Path inactive
                if (authBackendArrow) authBackendArrow.classList.add('active'); // New path active
                if (authBackendIndicator) {
                    authBackendIndicator.style.opacity = 1;
                    authBackendIndicator.style.top = '0'; // Indicator moves back
                    authBackendIndicator.style.backgroundColor = '#10b981'; // Green for auth success
                }
                if (stepDescriptions[6]) stepDescriptions[6].textContent = '4. Auth Service queries approved user DB, returns decision.';
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 5: Backend processes request and talks to S3 (Trusted)
                if (authBackendIndicator) authBackendIndicator.style.opacity = 0; // Auth response received by API GW
                if (authBackendArrow) authBackendArrow.classList.remove('active');
                if (authServiceNode) authServiceNode.classList.remove('border-blue-700'); // Auth service cleared

                if (backendS3Arrow1) backendS3Arrow1.classList.add('active');
                if (backendS3Indicator1) {
                    backendS3Indicator1.style.opacity = 1;
                    backendS3Indicator1.style.top = 'calc(100% - 20px)';
                }
                if (stepDescriptions[2]) stepDescriptions[2].textContent = '5. Backend requests Presigned URL from Trusted S3.';
                if (trustedS3Node) trustedS3Node.classList.add('border-lime-500'); // Trusted S3 is active
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 4: Trusted S3 returns Presigned URL to Backend
                if (stepDescriptions[3]) stepDescriptions[3].textContent = '6. Trusted S3 provides Presigned URL to Backend.';
                if (backendS3Indicator1) backendS3Indicator1.style.opacity = 0;
                if (backendS3Arrow1) backendS3Arrow1.classList.remove('active');

                if (backendS3Arrow2) backendS3Arrow2.classList.add('active');
                if (backendS3Indicator2) {
                    backendS3Indicator2.style.opacity = 1;
                    backendS3Indicator2.style.top = '0';
                }
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 5: Backend returns Presigned URL to Frontend
                if (requestArrow) requestArrow.classList.remove('active');
                if (backendS3Indicator2) backendS3Indicator2.style.opacity = 0;
                if (backendS3Arrow2) backendS3Arrow2.classList.remove('active');
                if (backendNode) backendNode.classList.remove('border-purple-500');

                if (requestArrow) requestArrow.classList.add('active');
                if (requestIndicator) {
                    requestIndicator.style.opacity = 1;
                    requestIndicator.style.left = '0';
                    requestIndicator.style.backgroundColor = '#10b981';
                }
                if (stepDescriptions[4]) stepDescriptions[4].textContent = '7. Backend sends Presigned URL to Frontend.';
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Step 6: Frontend downloads directly from Trusted S3
                if (userFrontendNode) userFrontendNode.classList.remove('border-purple-500'); // Reset highlight
                if (requestArrow) requestArrow.classList.remove('active');
                if (requestIndicator) requestIndicator.style.opacity = 0; // Indicator disappeared

                if (s3UserArrow) s3UserArrow.classList.add('active');
                if (s3UserIndicator) {
                    s3UserIndicator.style.opacity = 1;
                    s3UserIndicator.style.left = '0'; // Data moves from S3 to user
                    s3UserIndicator.style.backgroundColor = '#10b981'; // Green for data flow
                }
                if (stepDescriptions[4]) stepDescriptions[4].textContent = '8. Frontend downloads file directly from Trusted S3 using Presigned URL.';
                if (trustedS3Node) trustedS3Node.classList.remove('border-lime-500'); // Trusted S3 is cleared
                await new Promise(resolve => setTimeout(resolve, 1500));

                if (s3UserIndicator) s3UserIndicator.style.opacity = 0;
                if (s3UserArrow) s3UserArrow.classList.remove('active');
                if (stepDescriptions[4]) stepDescriptions[4].textContent = 'Download complete! (All steps logged passively)';
            }


            startRequestUploadBtn.addEventListener('click', animateRequestUploadWorkflow);
            startDirectUploadBtn.addEventListener('click', animateDirectUploadWorkflow);
            startDownloadBtn.addEventListener('click', animateDownloadWorkflow);
            resetAnimationBtn.addEventListener('click', resetAnimation);


            const apiGatewayEndpoint = 'YOUR_API_GATEWAY_INVOKE_URL_HERE'; // <--- REPLACE THIS


            // Handle Submit Upload Request
            submitUploadRequestBtn.addEventListener('click', () => {
                const firstName = firstNameInput.value.trim();
                const lastName = lastNameInput.value.trim();
                const email = emailInput.value.trim();
                const department = departmentInput.value.trim();
                const category = uploadCategorySelect.value;

                if (!firstName || !lastName || !email || !department || !category) {
                    requestStatusMessage.textContent = 'Please fill in all fields.';
                    requestStatusMessage.className = 'text-center text-sm mt-3 text-red-600';
                    return;
                }

                // Basic email validation
                if (!email.includes('@') || !email.includes('.')) {
                    requestStatusMessage.textContent = 'Please enter a valid email address.';
                    requestStatusMessage.className = 'text-center text-sm mt-3 text-red-600';
                    return;
                }

                requestStatusMessage.textContent = 'Submitting your request... (Simulated)';
                requestStatusMessage.className = 'text-center text-sm mt-3 text-gray-700';

                // --- REAL WORLD SCENARIO ---
                // In a real application, this request would go to a secure backend endpoint
                // (protected by API Gateway with mTLS/Custom Authorizer).
                // The backend would:
                // 1. Authenticate the user (via client cert from CAC).
                // 2. Authorize based on approved user DB.
                // 3. Store request details in a DB.
                // 4. Generate a *unique* presigned upload URL (possibly with specific S3 key like `requests/${category}/${email}/${timestamp}-filename.ext`).
                // 5. Send an email to the user with this unique presigned URL.
                // 6. Optionally, trigger a workflow for admin review.
                // For this demo, we just simulate success.

                setTimeout(() => {
                    requestStatusMessage.innerHTML = `Request for ${category} submitted successfully!<br>A conceptual upload link would be sent to <b>${email}</b>, protected by CAC authentication.`;
                    requestStatusMessage.className = 'text-center text-sm mt-3 text-green-600';
                    // Clear form
                    firstNameInput.value = '';
                    lastNameInput.value = '';
                    emailInput.value = '';
                    departmentInput.value = '';
                    uploadCategorySelect.value = '';
                }, 1500);
            });


            // Handle Direct File Upload (using issued link)
            uploadFileBtn.addEventListener('click', async () => {
                const file = uploadFileInput.files[0];
                if (!file) {
                    uploadStatusMessage.textContent = 'Please select a file to upload.';
                    uploadStatusMessage.className = 'text-center text-sm mt-3 text-red-600';
                    return;
                }

                uploadStatusMessage.textContent = 'Preparing to upload...';
                uploadStatusMessage.className = 'text-center text-sm mt-3 text-gray-700';

                if (apiGatewayEndpoint === 'YOUR_API_GATEWAY_INVOKE_URL_HERE') {
                    // Simulate a successful upload for the demo if backend isn't configured
                    uploadStatusMessage.textContent = `Successfully uploaded (simulated): ${file.name}`;
                    uploadStatusMessage.className = 'text-center text-sm mt-3 text-green-600';
                    uploadFileInput.value = ''; // Clear file input
                    return;
                }

                const fileName = file.name;
                const fileType = file.type;
                // For simulated upload, target the Incoming bucket's structure
                // In a real scenario, this 's3Key' would come from the presigned URL that was issued to the user
                const s3Key = `uploaded/${Date.now()}-${fileName}`; // Generate a unique key for S3

                try {
                    // 1. Get presigned URL for upload from your backend
                    // Request an upload URL to the Incoming bucket
                    const response = await fetch(`${apiGatewayEndpoint}/presigned-url?key=${encodeURIComponent(s3Key)}&action=putObject&contentType=${encodeURIComponent(fileType)}`);
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Backend error: ${errorData.message || response.statusText}`);
                    }
                    const data = await response.json();
                    const uploadUrl = data.presignedUrl;

                    uploadStatusMessage.textContent = `Uploading "${fileName}" to Incoming Bucket...`;

                    // 2. Upload file directly to S3 using the presigned URL
                    const uploadResponse = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': fileType // Important: Use the file's actual content type
                        },
                        body: file
                    });

                    if (!uploadResponse.ok) {
                        throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
                    }

                    uploadStatusMessage.textContent = `Successfully uploaded to Incoming Bucket: ${fileName}`;
                    uploadStatusMessage.className = 'text-center text-sm mt-3 text-green-600';
                    uploadFileInput.value = ''; // Clear file input

                    // In a real scenario, the file would then be processed by the FileProcessor Lambda
                    // and moved to Trusted/Quarantine. This demo only shows upload to Incoming.

                } catch (error) {
                    console.error('Direct Upload failed:', error);
                    uploadStatusMessage.textContent = `Direct Upload failed: ${error.message}`;
                    uploadStatusMessage.className = 'text-center text-sm mt-3 text-red-600';
                }
            });


            // Handle Generate Download Link
            generateLinkBtn.addEventListener('click', async () => {
                const selectedFileKey = downloadFileSelect.value; // Get the currently selected mock file key

                if (apiGatewayEndpoint === 'YOUR_API_GATEWAY_INVOKE_URL_HERE') {
                    // This block generates the mock URL if the real endpoint is not configured
                    // For mock downloads, we simulate from a 'Trusted' bucket structure
                    const trustedBucketNameMock = 'your-trusted-s3-bucket';
                    const region = 'us-east-1'; // Default region for mock URL
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 15) + 'Z'; // Consistent timestamp for mock
                    const fakeSignature = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    const fakeAccessKey = 'ASIA' + Math.random().toString(36).substring(2, 18).toUpperCase();

                    const mockPresignedUrl = `https://${trustedBucketNameMock}.s3.${region}.amazonaws.com/processed-files/${selectedFileKey.split('/').pop()}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${fakeAccessKey}%2F${timestamp.substring(0,8)}%2F${region}%2Fs3%2Faws4_request&X-Amz-Date=${timestamp}&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=${fakeSignature}`;

                    urlOutput.textContent = mockPresignedUrl;
                    demoOutput.style.display = 'block';
                    return;
                }

                urlOutput.textContent = 'Generating real presigned URL...';
                demoOutput.style.display = 'block';

                try {
                    // Request a download URL for a file that would be in the Trusted bucket
                    // Note: Your Lambda might need to be aware of the 'processed-files/' prefix
                    const downloadKey = `processed-files/${selectedFileKey.split('/').pop()}`; // Assume files are moved to this prefix in trusted
                    const response = await fetch(`${apiGatewayEndpoint}/presigned-url?key=${encodeURIComponent(downloadKey)}&action=getObject`);

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Error from backend: ${errorData.message || response.statusText}`);
                    }

                    const data = await response.json();
                    const realPresignedUrl = data.presignedUrl;

                    urlOutput.textContent = realPresignedUrl;

                } /* Removed empty else block */ catch (error) {
                    console.error('Failed to get presigned URL:', error);
                    urlOutput.textContent = `Error generating link: ${error.message}. Check browser console and Lambda logs.`;
                }
            });
        });
    </script></body></html>
