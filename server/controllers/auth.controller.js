import bcrypt from "bcryptjs";
import genToken from "../config/token.js"
import User from "../models/user.model.js"

// ─── Helper: set JWT cookie (same settings for all auth methods) ──────────────
const setAuthCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

// ─── Google OAuth ─────────────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ name, email, authProvider: "google" });
        }

        // If user previously signed up with email/password, block mixing
        if (user.authProvider === "email") {
            return res.status(400).json({
                message: "This email is registered with a password. Please use email & password to sign in."
            });
        }

        const token = await genToken(user._id);
        setAuthCookie(res, token);
        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({ message: `Google auth error: ${error.message}` });
    }
};

// ─── Email / Password — Register ─────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            if (existing.authProvider === "google") {
                return res.status(400).json({
                    message: "This email is already registered with Google. Please use Google Sign In."
                });
            }
            return res.status(400).json({ message: "Email already in use. Please log in instead." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            authProvider: "email"
        });

        const token = await genToken(user._id);
        setAuthCookie(res, token);

        // Never send the password hash to the client
        const { password: _, ...safeUser } = user.toObject();
        return res.status(201).json(safeUser);

    } catch (error) {
        return res.status(500).json({ message: `Registration error: ${error.message}` });
    }
};

// ─── Email / Password — Login ─────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (user.authProvider === "google") {
            return res.status(400).json({
                message: "This email is registered with Google. Please use Google Sign In."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = await genToken(user._id);
        setAuthCookie(res, token);

        const { password: _, ...safeUser } = user.toObject();
        return res.status(200).json(safeUser);

    } catch (error) {
        return res.status(500).json({ message: `Login error: ${error.message}` });
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logOut = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "strict",
        });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Logout error: ${error.message}` });
    }
};