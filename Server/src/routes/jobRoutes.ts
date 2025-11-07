import express from "express";
import { getAllJobs, getFreshers, getJobById, matchResumeText } from "../controllers/JobController.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/freshers", getFreshers);
router.get("/:id", getJobById);
router.post("/match-resume-text", matchResumeText);

export default router;
