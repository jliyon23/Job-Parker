import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiMapPin, FiCalendar, FiClock, FiBriefcase, FiExternalLink, FiLoader, FiStar, FiSearch, FiFilter, FiArrowUp, FiArrowDown } from "react-icons/fi";

const Freshers = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechpark, setSelectedTechpark] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first
  const [techparks, setTechparks] = useState([]);

  useEffect(() => {
    const fetchFreshers = async () => {
      try {
        // ✅ Fetch fresher jobs only
        const response = await axios.get("https://job-parker-api.vercel.app/api/jobs/freshers");
        setJobs(response.data);
        setFilteredJobs(response.data);
        
        // Extract unique techparks for filter
        const uniqueTechparks = [...new Set(response.data.map(job => job.techpark_name).filter(Boolean))];
        setTechparks(uniqueTechparks);
      } catch (error) {
        console.error("❌ Error fetching fresher jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshers();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = jobs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Techpark filter
    if (selectedTechpark) {
      filtered = filtered.filter(job => job.techpark_name === selectedTechpark);
    }

    // Sort by last date
    filtered = [...filtered].sort((a, b) => {
      if (!a.last_date && !b.last_date) return 0;
      if (!a.last_date) return 1;
      if (!b.last_date) return -1;
      
      const dateA = new Date(a.last_date);
      const dateB = new Date(b.last_date);
      
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedTechpark, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTechpark("");
    setSortOrder("desc");
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center space-x-2 text-green-600">
        <FiLoader className="animate-spin text-2xl" />
        <span className="text-lg font-medium">Loading fresher jobs...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-3 mb-2 sm:mb-0">
              <FiStar className="text-green-600 text-2xl" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Fresher Opportunities
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>
          <p className="text-gray-600 text-base lg:text-lg">
            Perfect entry-level positions for new graduates
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by role or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Techpark Filter */}
            <div className="flex-1">
              <select
                value={selectedTechpark}
                onChange={(e) => setSelectedTechpark(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm bg-white"
              >
                <option value="">All Locations</option>
                {techparks.map((techpark) => (
                  <option key={techpark} value={techpark}>
                    {techpark}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Button */}
            <button
              onClick={handleSortToggle}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
            >
              <FiClock className="mr-2" />
              <span className="hidden sm:inline">Sort by Date</span>
              {sortOrder === "desc" ? (
                <FiArrowDown className="ml-2" />
              ) : (
                <FiArrowUp className="ml-2" />
              )}
            </button>

            {/* Clear Filters */}
            {(searchTerm || selectedTechpark) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 max-w-md mx-auto p-6 sm:p-8">
              <FiStar className="text-4xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {jobs.length === 0 ? "No fresher jobs found" : "No jobs match your filters"}
              </h2>
              <p className="text-gray-500 text-sm">
                {jobs.length === 0 
                  ? "New opportunities will be posted soon"
                  : "Try adjusting your search or filters"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg"
              >
                {/* Card Header with Badge */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1">
                      FRESHER FRIENDLY
                    </span>
                    {job.last_date && (
                      <div className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 border border-red-200">
                        <FiClock className="mr-1" />
                        <span className="font-medium">
                          Deadline: {new Date(job.last_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Company Logo */}
                  {job.logo && (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={job.logo}
                        alt={`${job.company_name} Logo`}
                        className="h-12 sm:h-16 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Job Title */}
                  <div className="mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {job.role}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-2">
                      <FiBriefcase className="mr-2 text-sm shrink-0" />
                      <span className="font-medium truncate text-sm">
                        {job.company_name || "N/A"}
                      </span>
                    </div>
                    {job.techpark_name && (
                      <div className="flex items-center text-gray-600">
                        <FiMapPin className="mr-2 text-sm shrink-0" />
                        <span className="text-sm truncate">{job.techpark_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-green-600 text-white px-4 py-3 font-medium hover:bg-green-700 transition-colors duration-200 text-sm"
                  >
                    <span>Apply Now</span>
                    <FiExternalLink className="ml-2 text-sm" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Freshers;
