import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    // Only set for email/password users. Google users have no password.
    password: {
        type: String,
        default: null
    },
    // "google" or "email" — prevents mixing login methods on the same email
    authProvider: {
        type: String,
        enum: ["google", "email"],
        default: "google"
    },
    credits: {
        type: Number,
        default: 1000
    }

}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User