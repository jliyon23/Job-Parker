import { useState, useEffect } from 'react';
import { jobService } from '@/services/api';
import type { Job, PaginatedResponse } from '@/services/api';
import { JobCard } from '@/components/JobCard';
import { JobDetails } from '@/components/JobDetails';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface JobListProps {
  isFresher?: boolean;
}

export function JobList({ isFresher = false }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedResponse['pagination'] | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [page, search, isFresher]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = isFresher 
        ? await jobService.getFresherJobs(page, 12, search)
        : await jobService.getAllJobs(page, 12, search);
      
      setJobs(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Show job details page if a job is selected
  if (selectedJob) {
    return (
      <JobDetails 
        job={selectedJob} 
        onClose={() => setSelectedJob(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 max-w-3xl">
        <Input
          placeholder="Search by company, role, or job type..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 professional-input text-sm"
        />
        <Button onClick={handleSearch} size="default" className="professional-button text-sm font-medium px-6">
          <Search className="w-4 h-4 mr-2" />
          SEARCH
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="professional-section p-12 text-center text-gray-600">
          <p className="text-base font-medium">No jobs found</p>
          <p className="text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard 
                key={job._id} 
                job={job} 
                onViewDetails={(job) => setSelectedJob(job)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8 pt-8 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage || loading}
                className="professional-button-outline text-xs font-medium px-4"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                PREVIOUS
              </Button>
              
              <div className="px-4 py-2 border border-gray-300 bg-white">
                <span className="text-xs text-gray-700 font-medium">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="professional-button-outline text-xs font-medium px-4"
              >
                NEXT
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
