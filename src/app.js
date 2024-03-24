import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()

app.use(cors(
    {
        credentials: true,
        origin: process.env.CORS_OROGIN
    }
))

app.use(express.json(
    {
        limit: "20kb"
    }
))

app.use(express.urlencoded(
    {
        extended: true,
        limit: true
    }
))

app.use(cookieParser())


//---------------------------------------------------------------------

import { userRouter } from "./routes/user.route.js";

app.use('/api/v1/users', userRouter)


export { app } 