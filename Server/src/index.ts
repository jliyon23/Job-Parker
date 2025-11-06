import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import jobRoutes from "./routes/jobRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (_, res) => res.send("✅ Job API is running..."));
app.use("/api/jobs", jobRoutes);

const PORT = process.env.PORT || 4000;

// Export the Express app for Vercel
export default app;

// Only start the server if not in Vercel environment
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
