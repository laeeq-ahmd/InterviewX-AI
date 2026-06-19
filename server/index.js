import dotenv from "dotenv"
dotenv.config()

import connectDb from "./config/connectDb.js"
import app from "./app.js"

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectDb()
})

