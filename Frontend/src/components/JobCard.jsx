import React from "react";
import { FiClock, FiBriefcase, FiExternalLink, FiMapPin, FiInfo } from "react-icons/fi";
import { Link } from "react-router-dom";

const JobCard = ({ job, accent = "blue", alwaysShowFresherBadge = false }) => {
  const accentMap = {
    blue: {
      apply: "bg-blue-600 hover:bg-blue-700",
      fresherBg: "bg-green-100 text-green-800",
      borderHover: "hover:border-blue-300",
      viewMore: "border-blue-600 text-blue-600 hover:bg-blue-50"
    },
    green: {
      apply: "bg-green-600 hover:bg-green-700",
      fresherBg: "bg-green-100 text-green-800",
      borderHover: "hover:border-green-300",
      viewMore: "border-green-600 text-green-600 hover:bg-green-50"
    }
  };
  const ui = accentMap[accent] || accentMap.blue;
  const jobIdentifier = job?._id; // backend uses job_id in getJobById

  return (
    <div className={`bg-white border border-gray-200 ${ui.borderHover} transition-all duration-200 hover:shadow-lg`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          {(alwaysShowFresherBadge || job.is_fresher) && (
            <span className={`${ui.fresherBg} text-xs font-medium px-2 py-1`}>FRESHER FRIENDLY</span>
          )}
          {/* Deadline moved to bottom */}
        </div>
        {job.logo && (
          <div className="mb-4 flex justify-center">
            <img
              src={job.logo}
              alt={`${job.company_name} Logo`}
              className="h-12 sm:h-16 object-contain"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        )}
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">{job.role}</h2>
          <div className="flex items-center text-gray-600 mb-2">
            <FiBriefcase className="mr-2 text-sm shrink-0" />
            <span className="font-medium truncate text-sm">{job.company_name || "N/A"}</span>
          </div>
          {job.techpark_name && (
            <div className="flex items-center text-gray-600">
              <FiMapPin className="mr-2 text-sm shrink-0" />
              <span className="text-sm truncate">{job.techpark_name}</span>
            </div>
          )}
        </div>

        {/* Deadline at bottom (above buttons) */}
        {job.last_date && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-xs text-red-600  px-2 py-1 ">
              <FiClock className="mr-1" />
              <span className="font-medium">Last Date : {new Date(job.last_date).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center w-full ${ui.apply} text-white px-4 py-3 font-medium transition-colors duration-200 text-sm`}
          >
            <span>Apply Now</span>
            <FiExternalLink className="ml-2 text-sm" />
          </a>
          {jobIdentifier && (
            <Link
              to={`/jobs/${jobIdentifier}`}
              state={{ job }}
              className={`inline-flex items-center justify-center w-full border ${ui.viewMore} px-4 py-3 font-medium transition-colors duration-200 text-sm`}
            >
              <span>View More</span>
              <FiInfo className="ml-2 text-sm" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
