import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiMapPin, FiCalendar, FiClock, FiBriefcase, FiExternalLink, FiLoader, FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // ✅ use await
        const response = await axios.get("http://localhost:4000/api/jobs");
        setJobs(response.data);
        setFilteredJobs(response.data);
        
        // Extract unique companies for filter
        const uniqueCompanies = [...new Set(response.data.map(job => job.company_name).filter(Boolean))];
        setCompanies(uniqueCompanies);
      } catch (error) {
        console.error("❌ Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
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

    // Company filter
    if (selectedCompany) {
      filtered = filtered.filter(job => job.company_name === selectedCompany);
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
  }, [jobs, searchTerm, selectedCompany, sortOrder]);

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCompany("");
    setSortOrder("desc");
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center space-x-2 text-blue-600">
        <FiLoader className="animate-spin text-2xl" />
        <span className="text-lg font-medium">Loading jobs...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Job Listings
              </h1>
              <p className="text-gray-600 text-base lg:text-lg">
                Discover your next career opportunity
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Company Filter */}
            <div className="flex-1">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
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
            {(searchTerm || selectedCompany) && (
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
              <FiMapPin className="text-4xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {jobs.length === 0 ? "No jobs found" : "No jobs match your filters"}
              </h2>
              <p className="text-gray-500 text-sm">
                {jobs.length === 0 
                  ? "Check back later for new opportunities"
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
                className="bg-white border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg"
              >
                <div className="p-4 sm:p-6">
                  {/* Badges and Last Date */}
                  <div className="flex items-center justify-between mb-4">
                    {job.is_fresher && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1">
                        FRESHER FRIENDLY
                      </span>
                    )}
                    {job.last_date && (
                      <div className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 border border-red-200 ml-auto">
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
                  </div>

                  {/* Apply Button */}
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-4 py-3 font-medium hover:bg-blue-700 transition-colors duration-200 text-sm"
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

export default Home;
