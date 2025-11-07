import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import jobRoutes from "./routes/jobRoutes.js";
import { matchResumeText } from "./controllers/JobController.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

connectDB();

app.get("/", (_, res) => res.send("✅ Job API is running..."));
app.use("/api/jobs", jobRoutes);
// Also expose top-level route as requested
app.post("/api/match-resume-text", matchResumeText);

const PORT = process.env.PORT || 4000;

// Export the Express app for Vercel
export default app;

// Only start the server if not in Vercel environment
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
