import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"
import resumeRouter from "./routes/resume.route.js"

const app = express()
app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.startsWith("http://localhost")) return callback(null, true);
        
        // Strip trailing slashes for robust matching
        const cleanOrigin = origin.replace(/\/$/, "");
        const cleanClientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : "";
        
        if (cleanClientUrl && cleanOrigin === cleanClientUrl) return callback(null, true);
        
        // Fallback for Render environments (Portfolio project safe)
        if (cleanOrigin.endsWith(".onrender.com")) {
            console.warn(`[CORS Warning] Origin ${cleanOrigin} allowed by Render fallback. Expected: ${cleanClientUrl}`);
            return callback(null, true);
        }
        
        console.error(`[CORS Error] Blocked origin: ${cleanOrigin} | Expected: ${cleanClientUrl}`);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/resume", resumeRouter)

// Health check endpoint for Docker & k8s probes
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

export default app
