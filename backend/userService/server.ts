import express from "express"
import userRouter from "./routes/user.routes"
import webhookRouter from "./routes/webhook.routes"
import cors from 'cors'
import { corsOptions } from "./config/corsOptions"
import { clerkMiddleware } from '@clerk/express'
import 'dotenv/config'

const app = express();
const PORT = 80;

app.use(cors(corsOptions))

// Clerk webhook needs raw byte data for signature verification
app.use("/webhooks", express.raw({ type: 'application/json' }),  webhookRouter)

app.use(express.json())
app.use(clerkMiddleware())

app.use("/users", userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});