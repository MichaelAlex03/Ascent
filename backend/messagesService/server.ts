import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { corsOptions } from './config/corsOptions';
import { clerkMiddleware } from '@clerk/express';

const app = express();
const PORT = 82

app.use(cors(corsOptions));

app.use(express.json());

app.use(clerkMiddleware());


app.use()