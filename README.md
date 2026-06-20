# InterviewX AI (Now CareerX AI)

**InterviewX AI** is an AI-powered mock interview platform that helps candidates practice realistic technical and HR interviews, complete with real-time AI evaluation, resume analysis, and detailed performance reports. 

**Live Demo:** https://careerx-client.onrender.com/

## What's New in v2
- **Resume Intelligence Suite:** Upload your resume PDF for ATS compatibility analysis and scoring.
- **One-Click Resume Customizer:** AI automatically tailors your existing resume to perfectly match any given Job Description.
- **Cover Letter Generator:** Instantly generate highly personalized cover letters based on your resume and targeted role.
- **Credit and Payment System:** Fully integrated Razorpay gateway for seamless premium credit purchases.
- **Kubernetes Architecture:** The entire application is now fully containerized and orchestrated with Kubernetes for scalable, local, and production deployments.

*(Features from v1: AI-Powered voice interviews, real-time evaluation across Confidence, Communication, and Correctness, performance analytics, and Firebase authentication.)*

## Features

- **AI-Powered Interviews**: Generates role-specific, experience-appropriate interview questions using GPT-4o-mini via OpenRouter.
- **Resume Intelligence**: Upload your resume PDF, and the AI will extract your skills/projects to ask tailored questions.
- **Voice Interaction**: Supports voice-based answering using the Web Speech API with AI speaking questions aloud.
- **Real-Time Evaluation**: Each answer is scored in real-time across 3 dimensions: Confidence, Communication, and Correctness.
- **Performance Analytics**: View charts, progress bars, and a question-wise breakdown of your performance.
- **Downloadable Reports**: Export a professional PDF report with your scores and personalized advice.
- **Credit-Based System**: Freemium model with Razorpay integration for purchasing additional interview credits.
- **Google Authentication**: Passwordless one-click sign-in via Firebase.

---

## Tech Stack

**Frontend:**
- **Framework**: React 19 + Vite
- **Styling**: TailwindCSS v4
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **Animations**: Framer Motion
- **Charts & UI**: Recharts, react-circular-progressbar
- **Auth**: Firebase (Google OAuth)
- **Payments**: Razorpay Checkout

**Backend:**
- **Runtime & Framework**: Node.js + Express.js v5
- **Database**: MongoDB + Mongoose v9
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload & Parsing**: Multer + pdfjs-dist (for Resume Parsing)
- **Payments**: Razorpay SDK
- **AI Gateway**: OpenRouter API (GPT-4o-mini)

**DevOps & Infrastructure:**
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (Minikube / k3s)
- **CI/CD**: GitHub Actions
- **Deployment**: Render (Infrastructure as Code via render.yaml)

---

## Environment Variables

The application requires several environment variables to function correctly. **Never commit .env files to version control.**

### Backend (server/.env)
Create a .env file in the server directory using server/.env.example as a template:
```env
PORT=8000
MONGODB_URL=your_mongodb_url
JWT_SECRET=your_secret_key
OPENROUTER_API_KEY=your_openrouter_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLIENT_URL=http://localhost:5173
CHROMA_URL=http://chromadb:8000
```
*(Note: Keep MongoDB external. Do not run it in a local container).*

### Frontend (client/.env)
Create a .env file in the client directory:
```env
VITE_SERVER_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

## Kubernetes Local Setup (Minikube)

The entire application is fully containerized and the microservices are orchestrated using Kubernetes. The custom application images are hosted publicly on DockerHub:
- **Frontend Image:** [`laeeqahmd/careerx-frontend:latest`](https://hub.docker.com/r/laeeqahmd/careerx-frontend)
- **Backend Image:** [`laeeqahmd/careerx-backend:latest`](https://hub.docker.com/r/laeeqahmd/careerx-backend)

When deployed, the Kubernetes cluster automatically pulls these custom images alongside the official `chromadb/chroma:latest` infrastructure image.

### Prerequisites
- Docker Desktop
- Minikube
- kubectl

### Deployment Steps
1. Copy the secrets template and fill in your actual values:
```bash
cp k8s/secrets.template.yaml k8s/secrets.yaml
```
2. Run the deployment script from the root of the repository:
```bash
bash k8s/deploy-local.sh
```
3. The script will automatically start Minikube, apply the Kubernetes manifests (Backend, Frontend, ChromaDB, Ingress), and set up local DNS routing.
4. Access the application at http://careerx.local.

---

## Docker Setup (Docker Compose)

You can run the entire stack (Frontend, Backend, ChromaDB) via Docker Compose. This ensures a consistent environment and is identical to how the app is built for production.

1. Ensure Docker and Docker Compose are installed.
2. Ensure both .env files are created as detailed above.
3. Run the stack:
```bash
docker compose up --build
```
- The **frontend** will be available at http://localhost
- The **backend** will be available at http://localhost:8000

---

## Local Setup (Non-Docker)

For active development, you can run the services manually using Node.js.

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account/cluster

### 1. Run the Backend
```bash
cd server
npm install
npm run dev
```

### 2. Run the Frontend
```bash
cd client
npm install
npm run dev
```
The client will run on http://localhost:5173.

---

## Troubleshooting

- **MongoDB Atlas Connection Issues:** Ensure your IP address (or 0.0.0.0/0 for production) is whitelisted in the MongoDB Atlas Network Access settings.
- **OpenRouter API Issues:** If the AI features fail, verify your OPENROUTER_API_KEY is correct and has available billing credits.
- **Port Conflicts:** If docker compose up fails due to ports being in use, ensure no local instances of Node or Nginx are running on ports 80 or 8000.
- **Docker Build Failures (Frontend):** Vite fails fast if required environment variables are missing. Ensure client/.env is fully populated before running docker compose build.
- **Missing Environment Variables:** If authentication or payments fail, double check that RAZORPAY_KEY_ID and Firebase variables exactly match your cloud provider consoles.

---

## Project Structure

```text
InterviewX AI/
├── client/            # React + Vite frontend application
├── server/            # Node.js + Express backend API
├── k8s/               # Kubernetes deployment manifests and scripts
├── docker-compose.yml # Orchestration configuration
```
