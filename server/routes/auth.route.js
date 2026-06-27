import express from "express"
import { googleAuth, logOut, register, login } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/google", googleAuth)
authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.get("/logout", logOut)

export default authRouter