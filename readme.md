SocialSync - Multi-Platform Social Media Manager

SocialSync is a full-stack application that allows users to input news, articles, or documents (PDF/Word), automatically rewrite them for specific social media platforms (X/Twitter, Facebook, LinkedIn) using AI, and publish them simultaneously.

Features

AI-Powered Content Generation: Uses Google's Gemini API to rewrite content into platform-specific styles (Punchy for X, Casual for FB, Professional for LinkedIn).

Multi-Modal Input: Accepts text paste, PDF uploads, and Word (.docx) documents.

Real OAuth Integration: Securely links user accounts to X, Facebook, and LinkedIn.

Simultaneous Publishing: Publishes to all connected platforms with a single click.

Live Previews: Edit generated drafts before they go live.

Prerequisites

Node.js (v16 or higher)

npm (Node Package Manager)

Google Gemini API Key (for content generation)

Developer Accounts for X, Facebook, and LinkedIn (for OAuth credentials)

Setup Instructions

1. Backend Setup (Node.js/Express)

The backend handles secure token storage, OAuth handshakes, and API posting logic.

Create a folder named backend.

Initialize the project and install dependencies:

mkdir backend
cd backend
npm init -y
npm install express cors dotenv axios cookie-parser querystring


Create a server.js file and paste the backend code provided in the project files.

Create a .env file in the backend folder with your credentials:

# .env

# OAuth Credentials (get these from provider developer portals)
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret

FACEBOOK_CLIENT_ID=your_fb_app_id
FACEBOOK_CLIENT_SECRET=your_fb_secret

LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret

# Frontend URL (Ensure this matches your React dev server port)
FRONTEND_URL=http://localhost:5173 


Important: Configure "Redirect URIs" in your developer portals to match the backend routes:

X: http://localhost:4000/auth/x/callback

Facebook: http://localhost:4000/auth/facebook/callback

LinkedIn: http://localhost:4000/auth/linkedin/callback

Start the backend server:

node server.js


Server should run on http://localhost:4000.

2. Frontend Setup (React + Vite)

The frontend provides the UI for drafting and managing connections.

Create a Vite project (if you haven't already):

npm create vite@latest social-sync -- --template react
cd social-sync


Install dependencies:

npm install
npm install lucide-react


(Ensure Tailwind CSS is also configured as per standard Vite/Tailwind instructions).

Paste the SocialManager.jsx code into your main App component (e.g., src/App.jsx).

Configure Gemini API Key:

Open SocialManager.jsx.

Locate the generateDrafts function.

Insert your API key into the const apiKey = "YOUR_KEY_HERE"; variable.

Start the frontend:

npm run dev


App typically runs on http://localhost:5173.

Usage Guide

Drafting Content:

Text: Paste a URL or article text directly into the "Source Content" box.

File: Click "Upload File" to select a PDF or .docx file. The app will read the file and use it as context.

Generating Drafts:

Click "Generate Drafts".

The AI will populate the three preview windows (X, Facebook, LinkedIn) with tailored content.

You can manually edit any draft in these windows.

Connecting Accounts:

Click the "Connect" button above any platform editor.

You will be redirected to the social platform's login page to authorize the app.

Once authorized, you will be redirected back to the app, and the status will change to "Connected" (Green).

Publishing:

Once you are satisfied with the drafts and accounts are connected, click "Publish All Now".

The app will send the posts to the backend, which communicates with the social media APIs.

A success banner will appear upon completion.

Troubleshooting

CORS Errors: Ensure BACKEND_URL in frontend matches the port of your running Node server, and FRONTEND_URL in server.js matches your React app URL.

OAuth Redirect Failures: Double-check that the "Redirect URI" in your code EXACTLY matches what is listed in your Twitter/Facebook/LinkedIn developer dashboard apps.

Generation Failed: Ensure your Google Gemini API key is valid and has quota available.