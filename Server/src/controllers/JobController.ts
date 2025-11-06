import type { Request, Response } from "express";
import Job from "../models/Job.js";

export const getAllJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching all jobs");
    const jobs = await Job.find().sort({ scraped_at: -1 });
    console.log(`Fetched ${jobs.length} jobs`);
    res.json(jobs);
  } catch (error: unknown) {
    console.error("getAllJobs error", error);
    res.status(500).json({ error: "Error fetching jobs" });
  }
};

export const getFreshers = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find({ is_fresher: true }).sort({ scraped_at: -1 });
    res.json(jobs);
  } catch (error: unknown) {
    console.error("getFreshers error", error);
    res.status(500).json({ error: "Error fetching fresher jobs" });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findOne({ job_id: req.params.id });
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(job);
  } catch (error: unknown) {
    console.error("getJobById error", error);
    res.status(500).json({ error: "Error fetching job" });
  }
};
