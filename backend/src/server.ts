import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import quizRoutes from "./routes/quizRoutes";

dotenv.config();
const app: Application = express();

// Middleware
app.use(cors({ origin: "https://quiz-app-fe-h98s.onrender.com" }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api", quizRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
