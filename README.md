# InterviewIQ.AI

**InterviewIQ.AI** is an AI-powered mock interview platform that helps candidates practice realistic technical and HR interviews, complete with real-time AI evaluation, resume analysis, and detailed performance reports. 

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

**Backend:**
- **Runtime & Framework**: Node.js + Express.js v5
- **Database**: MongoDB + Mongoose v9
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload & Parsing**: Multer + pdfjs-dist (for Resume Parsing)
- **Payments**: Razorpay SDK
- **AI Gateway**: OpenRouter API (GPT-4o-mini)

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB account/cluster
- Firebase Project (for Google Auth)
- Razorpay Account (for Payments)
- OpenRouter API Key (for AI features)

### 1. Clone & Setup
Clone the repository to your local machine. You will find two main directories: `client` and `server`.

### 2. Environment Variables

Create a `.env` file in the **`server`** directory:
```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OPENROUTER_API_KEY=your_openrouter_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Create a `.env` file in the **`client`** directory:
```env
VITE_FIREBASE_APIKEY=your_firebase_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Run the Backend
Open a terminal and navigate to the `server` folder:
```bash
cd server
npm install
npm run dev
```

### 4. Run the Frontend
Open a separate terminal and navigate to the `client` folder:
```bash
cd client
npm install
npm run dev
```
The client will usually run on `http://localhost:5173`.

---

## Project Structure

```text
InterviewX AI/
├── client/         # React + Vite frontend application
├── server/         # Node.js + Express backend API
└── docs/           # Comprehensive project documentation
```

## Documentation

For a deep dive into the architecture, request flows, tech stack choices, and AI prompts, please check the [`docs/`](./docs) directory. It contains detailed markdown files covering every aspect of the project.
