import express from 'express';
import "dotenv/config";
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import BookRoutes from './routes/BookRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())

app.use(express.json())

console.log({PORT})

app.use("/api/auth",authRoutes);
app.use("/api/book",BookRoutes);

app.listen(PORT,()=> {
    console.log("Jiren the Great.....");
    connectDB();
})