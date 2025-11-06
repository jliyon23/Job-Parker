import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiFileText, FiCalendar, FiClock, FiBriefcase, FiExternalLink, FiLoader, FiUpload } from "react-icons/fi";

const ResumeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumeJobs = async () => {
      try {
        // Fetch jobs that require resume submission
        const response = await axios.get("http://localhost:4000/api/jobs/resume");
        setJobs(response.data);
      } catch (error) {
        console.error("❌ Error fetching resume jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeJobs();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center space-x-2 text-purple-600">
        <FiLoader className="animate-spin text-2xl" />
        <span className="text-lg font-medium">Loading resume-based jobs...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <FiFileText className="text-purple-600 text-2xl" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Resume-Based Jobs
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Opportunities that require resume submission
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 max-w-md mx-auto p-8">
              <FiUpload className="text-4xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No resume jobs found
              </h2>
              <p className="text-gray-500">
                Check back later for new opportunities
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-gray-200 p-6 hover:border-purple-300 transition-colors duration-200"
              >
                {/* Resume Required Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1">
                    RESUME REQUIRED
                  </span>
                </div>

                {/* Job Title */}
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {job.role}
                  </h2>
                  <div className="flex items-center text-gray-600 mb-2">
                    <FiBriefcase className="mr-2 text-sm shrink-0" />
                    <span className="font-medium truncate">
                      {job.company_name || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar className="mr-2 shrink-0" />
                    <span>Posted: {job.posted || "Unknown"}</span>
                  </div>
                  {job.last_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiClock className="mr-2 shrink-0" />
                      <span>Deadline: {job.last_date}</span>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-purple-600 text-white px-4 py-3 font-medium hover:bg-purple-700 transition-colors duration-200"
                >
                  <span>Submit Resume</span>
                  <FiExternalLink className="ml-2 text-sm" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeJobs