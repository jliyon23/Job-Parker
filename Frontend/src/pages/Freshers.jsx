import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiStar, FiSearch, FiLoader } from "react-icons/fi";
import JobCard from "../components/JobCard";
import Pagination from "../components/Pagination";

// Simple cache helpers for fresher list
const FRESHERS_CACHE_KEY = 'jobs-freshers-cache-v1';
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

function loadCache() {
  try { return JSON.parse(localStorage.getItem(FRESHERS_CACHE_KEY)) || {}; } catch { return {}; }
}
function saveCache(cache) {
  try { localStorage.setItem(FRESHERS_CACHE_KEY, JSON.stringify(cache)); } catch { /* ignore */ }
}
function buildKey({ page, limit, search }) {
  return JSON.stringify({ page, limit, search: search || '', scope: 'freshers' });
}
function getCached(params) {
  const cache = loadCache();
  const key = buildKey(params);
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
  return entry;
}
function setCached(params, data) {
  const cache = loadCache();
  cache[buildKey(params)] = { ts: Date.now(), data };
  saveCache(cache);
}

const Freshers = () => {
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
    fetchFreshers();
  }, [pagination.currentPage, searchTerm]);

  const fetchFreshers = async () => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
    };

    // Cache first
    const cached = getCached({
      page: params.page,
      limit: params.limit,
      search: params.search,
    });
    if (cached) {
      setJobs(cached.data.items);
      setPagination(cached.data.pagination);
      setLoading(false);
      revalidate(params, cached.data.hash);
      return;
    }

    await revalidate(params);
  };

  const revalidate = async (params, previousHash = null) => {
    try {
      setLoading(!previousHash);
      const response = await axios.get("https://job-parker-api.vercel.app/api/jobs/freshers", { params });
      const items = response.data.data;
      const paginationData = response.data.pagination;
      const hash = JSON.stringify({ len: items.length, first: items[0]?._id, total: paginationData.totalItems });
      if (hash !== previousHash) {
        setJobs(items);
        setPagination(paginationData);
        setCached({ page: params.page, limit: params.limit, search: params.search }, { items, pagination: paginationData, hash });
      }
      if (params.page === 1) {
        const uniqueTechparks = [...new Set(items.map(job => job.techpark_name).filter(Boolean))];
        if (uniqueTechparks.length) setTechparks(uniqueTechparks);
      }
    } catch (error) {
      console.error("❌ Error fetching fresher jobs:", error);
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
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} jobs
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-24 py-3 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={() => handleSearch(searchInput)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm"
            >
              Search
            </button>
          </div>

          {/* Filters Row */}
          {/* <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedTechpark}
                onChange={(e) => handleTechparkFilter(e.target.value)}
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

            <button
              onClick={clearFilters}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              disabled={!searchTerm && !selectedTechpark}
            >
              Clear Filters
            </button>
          </div> */}
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 max-w-md mx-auto p-6 sm:p-8">
              <FiStar className="text-4xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {pagination.totalItems === 0 ? "No fresher jobs found" : "No jobs match your filters"}
              </h2>
              <p className="text-gray-500 text-sm">
                {pagination.totalItems === 0 
                  ? "New opportunities will be posted soon"
                  : "Try adjusting your search or filters"
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} accent="green" alwaysShowFresherBadge />
              ))}
            </div>
            <Pagination
              pagination={pagination}
              onPageChange={(p) => handlePageChange(p)}
              color="green"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Freshers;
