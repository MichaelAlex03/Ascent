import express from "express"
import userRouter from "./routes/user.routes"
import webhookRouter from "./routes/webhook.routes"
import 'dotenv/config'

const app = express();
const PORT = 80;



app.use(express.raw({ type: 'application/json' }));

app.use("/webhooks", webhookRouter)

app.use(express.json())

// app.use("/users", userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});