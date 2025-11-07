import type { Request, Response } from "express";
import Job from "../models/Job.js";
import natural from "natural";

// Pagination interface for better type safety
interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  techpark?: string; // added
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getAllJobs = async (req: Request<{}, {}, {}, PaginationQuery>, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const search = req.query.search || "";
    const techpark = req.query.techpark || "";

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
    const skip = (validPage - 1) * validLimit;

    // Build search query
    const searchQuery: any = search
      ? {
          $or: [
            { company_name: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
            { job_type: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
          ]
        }
      : {};
    if (techpark) searchQuery.techpark_name = techpark; // apply techpark filter

    console.log(`Fetching jobs - Page: ${validPage}, Limit: ${validLimit}, Search: "${search}"`);

    // Get total count for pagination
    const totalItems = await Job.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / validLimit);

    // Fetch paginated jobs
    const jobs = await Job.find(searchQuery)
      .sort({ scraped_at: -1 })
      .skip(skip)
      .limit(validLimit);

    const response: PaginatedResponse<typeof jobs[0]> = {
      data: jobs,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1
      }
    };

    console.log(`Fetched ${jobs.length} jobs out of ${totalItems} total`);
    res.json(response);
  } catch (error: unknown) {
    console.error("getAllJobs error", error);
    res.status(500).json({ error: "Error fetching jobs" });
  }
};

export const getFreshers = async (req: Request<{}, {}, {}, PaginationQuery>, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const search = req.query.search || "";
    const techpark = req.query.techpark || "";

    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);
    const skip = (validPage - 1) * validLimit;

    const base: any = { is_fresher: true };
    if (techpark) base.techpark_name = techpark;
    const searchQuery: any = {
      ...base,
      ...(search && {
        $or: [
          { company_name: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
          { job_type: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      })
    };

    console.log(`Fetching fresher jobs - Page: ${validPage}, Limit: ${validLimit}, Search: "${search}"`);

    const totalItems = await Job.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / validLimit);

    const jobs = await Job.find(searchQuery)
      .sort({ scraped_at: -1 })
      .skip(skip)
      .limit(validLimit);

    const response: PaginatedResponse<typeof jobs[0]> = {
      data: jobs,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalItems,
        itemsPerPage: validLimit,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1
      }
    };

    console.log(`Fetched ${jobs.length} fresher jobs out of ${totalItems} total`);
    res.json(response);
  } catch (error: unknown) {
    console.error("getFreshers error", error);
    res.status(500).json({ error: "Error fetching fresher jobs" });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    let job = null;
    try {
      job = await Job.findById(id);
    } catch (_) {
      // ignore cast errors
    }
    if (!job) {
      job = await Job.findOne({ job_id: id });
    }
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

export const matchResumeText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body as { text?: string };
    if (!text || text.trim().length < 50) {
      res.status(400).json({ error: "Resume text too short or missing" });
      return;
    }

    type JobLean = {
      _id: string;
      role?: string;
      company_name?: string;
      description?: string;
      link?: string;
      last_date?: string;
      techpark_name?: string;
      is_fresher?: boolean;
      logo?: string;
      job_id?: string;
    };

    const jobs = (await Job.find({}, {
      description: 1, role: 1, company_name: 1, link: 1, last_date: 1, techpark_name: 1, is_fresher: 1, logo: 1, job_id: 1
    }).lean()) as unknown as JobLean[];

    const tokenizer: any = new (natural as any).WordTokenizer();
    const resumeTokens: string[] = tokenizer.tokenize(text.toLowerCase());
    const resumeFreq: Record<string, number> = {};
    resumeTokens.forEach((t: string) => { resumeFreq[t] = (resumeFreq[t] || 0) + 1; });
    const resumeMagnitude = Math.sqrt(Object.values(resumeFreq).reduce((sum, v) => sum + v * v, 0));

    const scored: Array<JobLean & { score: number }> = jobs.map((job: JobLean) => {
      const jobText = `${job.role || ''} ${job.company_name || ''} ${job.description || ''}`.toLowerCase();
      const jobTokens: string[] = tokenizer.tokenize(jobText);
      const jobFreq: Record<string, number> = {};
      jobTokens.forEach((t: string) => { jobFreq[t] = (jobFreq[t] || 0) + 1; });
      const intersection = Object.keys(resumeFreq).filter(k => jobFreq[k]);
      const dot = intersection.reduce((sum, k) => sum + resumeFreq[k] * jobFreq[k], 0);
      const jobMagnitude = Math.sqrt(Object.values(jobFreq).reduce((sum, v) => sum + v * v, 0));
      const cosine = jobMagnitude === 0 || resumeMagnitude === 0 ? 0 : dot / (resumeMagnitude * jobMagnitude);
      const jw = (natural as any).JaroWinklerDistance(text.slice(0, 4000), jobText.slice(0, 4000));
      const score = (cosine * 0.7) + (jw * 0.3);
      return { ...job, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 10);

    res.json({ matches: top, totalConsidered: jobs.length });
  } catch (error) {
    console.error("matchResumeText error", error);
    res.status(500).json({ error: "Error matching resume" });
  }
};
