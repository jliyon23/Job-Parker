import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  // Common fields for all parks
  company_name: { type: String, required: true },
  role: { type: String, required: true },
  job_type: { type: String, default: "" },
  posted: { type: String, default: "unknown" },
  link: { type: String, required: true },
  logo: { type: String, default: "" },
  description: { type: String, default: "" },
  is_fresher: { type: Boolean, default: false },
  job_id: { type: String, unique: true },
  scraped_at: { type: Date, default: Date.now },

  // Additional park-specific fields
  last_date: { type: String, default: "" },       // Infopark
  techpark_name: { type: String, default: "" },   // Infopark / Technopark / Cyberpark identifier
});

export default mongoose.model("jobs", jobSchema);
