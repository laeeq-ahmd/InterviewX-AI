import express from "express";
import { analyzeAts, customizeResume, getResumeVersions, generateCoverLetter } from "../controllers/resume.controller.js";
import isAuth from "../middlewares/isAuth.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/analyze-ats", isAuth, upload.single("resume"), analyzeAts);
router.post("/customize", isAuth, upload.single("resume"), customizeResume);
router.post("/generate-cover-letter", isAuth, upload.single("resume"), generateCoverLetter);
router.get("/versions", isAuth, getResumeVersions);

export default router;
