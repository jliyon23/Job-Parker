import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiLoader, FiSearch, FiMapPin } from "react-icons/fi";
import JobCard from "../components/JobCard";
import Pagination from "../components/Pagination";

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedTechpark, setSelectedTechpark] = useState("");
  const [techparks, setTechparks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  useEffect(() => {
    fetchJobs();
  }, [pagination.currentPage, searchTerm, selectedTechpark]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedTechpark && { techpark: selectedTechpark }) // send techpark to backend
      };
      
      const response = await axios.get("https://job-parker-api.vercel.app/api/jobs", { params });
      setJobs(response.data.data);
      setPagination(response.data.pagination);
      
      // Extract unique techparks for filter
      if (pagination.currentPage === 1) {
        const uniqueTechparks = [...new Set(response.data.data.map(job => job.techpark_name).filter(Boolean))];
        setTechparks(uniqueTechparks);
      }
    } catch (error) {
      console.error("❌ Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleTechparkFilter = (techpark) => {
    setSelectedTechpark(techpark);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchInput("");
    setSelectedTechpark("");
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} jobs
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-24 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={() => handleSearch(searchInput)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
            >
              Search
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Techpark Filter */}
            <div className="flex-1">
              <select
                value={selectedTechpark}
                onChange={(e) => handleTechparkFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
              >
                <option value="">All Locations</option>
               
                  <option key={"technopark"} value={"technopark"}>
                    Technopark
                  </option>
                  <option key={"infopark"} value={"infopark"}>
                    Infopark
                  </option>
                  <option key={"cyberpark"} value={"cyberpark"}>
                    Cyberpark
                  </option>
               
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              disabled={!searchTerm && !selectedTechpark}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 max-w-md mx-auto p-6 sm:p-8">
              <FiMapPin className="text-4xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {pagination.totalItems === 0 ? "No jobs found" : "No jobs match your filters"}
              </h2>
              <p className="text-gray-500 text-sm">
                {pagination.totalItems === 0 
                  ? "Check back later for new opportunities"
                  : "Try adjusting your search or filters"
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} accent="blue" />
              ))}
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={(p) => handlePageChange(p)}
              color="blue"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
