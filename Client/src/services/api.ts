import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://job-parker-api.vercel.app/api';

export interface Job {
  _id: string;
  company_name: string;
  role: string;
  job_type: string;
  posted: string;
  link: string;
  logo: string;
  description: string;
  is_fresher: boolean;
  job_id: string;
  scraped_at: string;
  last_date?: string;
  techpark_name?: string;
}

export interface PaginatedResponse {
  data: Job[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MatchedJob extends Job {
  matchScore: number;
  matchedSkills: string[];
}

export interface ResumeMatchResponse {
  matches: MatchedJob[];
  totalMatches: number;
}

// Backend response type (what we actually receive)
interface BackendMatchedJob extends Job {
  score: number;
}

interface BackendResumeMatchResponse {
  matches: BackendMatchedJob[];
  totalConsidered: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache implementation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<any>>();

function getCacheKey(endpoint: string, params: Record<string, any>): string {
  return `${endpoint}_${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export const jobService = {
  getAllJobs: async (page = 1, limit = 10, search = '', techpark = '') => {
    const cacheKey = getCacheKey('jobs', { page, limit, search, techpark });
    const cached = getFromCache<PaginatedResponse>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached data for all jobs');
      return cached;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(techpark && { techpark }),
    });
    
    console.log('🌐 Fetching fresh data for all jobs');
    const response = await api.get<PaginatedResponse>(`/jobs?${params}`);
    setCache(cacheKey, response.data);
    return response.data;
  },

  getFresherJobs: async (page = 1, limit = 10, search = '', techpark = '') => {
    const cacheKey = getCacheKey('freshers', { page, limit, search, techpark });
    const cached = getFromCache<PaginatedResponse>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached data for fresher jobs');
      return cached;
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(techpark && { techpark }),
    });
    
    console.log('🌐 Fetching fresh data for fresher jobs');
    const response = await api.get<PaginatedResponse>(`/jobs/freshers?${params}`);
    setCache(cacheKey, response.data);
    return response.data;
  },

  getJobById: async (id: string) => {
    const cacheKey = getCacheKey('job', { id });
    const cached = getFromCache<Job>(cacheKey);
    
    if (cached) {
      console.log('📦 Using cached data for job:', id);
      return cached;
    }

    console.log('🌐 Fetching fresh data for job:', id);
    const response = await api.get<Job>(`/jobs/${id}`);
    setCache(cacheKey, response.data);
    return response.data;
  },

  matchResumeText: async (resumeText: string) => {
    // Don't cache resume matching as it's user-specific and dynamic
    console.log('🌐 Matching resume (no cache)');
    const response = await api.post<BackendResumeMatchResponse>('/jobs/match-resume-text', {
      text: resumeText,  // Backend expects 'text', not 'resumeText'
    });
    
    // Transform backend response to frontend format
    const matches: MatchedJob[] = response.data.matches.map((job) => ({
      ...job,
      matchScore: Math.round(job.score * 100), // Convert 0-1 score to 0-100 percentage
      matchedSkills: [], // Backend doesn't provide this yet, so empty array for now
    }));
    
    return {
      matches,
      totalMatches: response.data.totalConsidered,
    };
  },

  // Clear cache manually if needed
  clearCache: () => {
    cache.clear();
    console.log('🗑️ Cache cleared');
  },
};
