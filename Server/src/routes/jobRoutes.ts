import express from "express";
import { getAllJobs, getFreshers, getJobById } from "../controllers/JobController.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/freshers", getFreshers);
router.get("/:id", getJobById);

export default router;
