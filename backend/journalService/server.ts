import express from 'express';
import journalRouter from './routes/journal.routes'
import 'dotenv/config'
import cors from 'cors'
import { corsOptions } from './config/corsOptions';
import { clerkMiddleware } from '@clerk/express'

const app = express();
const PORT = 81

app.use(cors(corsOptions));

app.use(express.json());

app.use(clerkMiddleware())


app.use('/journals', journalRouter);


app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})