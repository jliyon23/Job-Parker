import type { Request, Response } from "express";
import Job from "../models/Job.js";

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
    const job = await Job.findById(req.params.id);
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
