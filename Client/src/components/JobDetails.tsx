import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Job } from '@/services/api';
import { 
  Building2, 
  Briefcase, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface JobDetailsProps {
  job?: Job;
  onClose: () => void;
}

export function JobDetails({ job: initialJob, onClose }: JobDetailsProps) {
  const [job, setJob] = useState<Job | null>(initialJob || null);

  useEffect(() => {
    if (initialJob) {
      setJob(initialJob);
    }
  }, [initialJob]);

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Job not found</p>
          <Button onClick={onClose} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            GO BACK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="professional-header sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              className="gap-2 text-black hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">BACK TO JOBS</span>
              <span className="sm:hidden">BACK</span>
            </Button>
            <Button
              variant="default"
              onClick={() => window.open(job.link, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              APPLY NOW
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Company Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-start gap-6">
            {job.logo && (
              <div className="w-20 h-20 border border-gray-200 flex items-center justify-center flex-shrink-0 bg-white p-2">
                <img 
                  src={job.logo} 
                  alt={job.company_name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-semibold text-black mb-2 break-words">
                {job.role}
              </h1>
              <div className="flex items-center gap-2 text-lg text-gray-700 mb-3">
                <Building2 className="w-5 h-5 flex-shrink-0" />
                <span className="break-words">{job.company_name}</span>
              </div>
              {job.is_fresher && (
                <div className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-50 border border-green-300 text-green-700 uppercase tracking-wide">
                  FRESHER FRIENDLY
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Meta Information */}
        <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-black uppercase tracking-wide mb-4">
            Job Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {job.job_type && (
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Job Type</p>
                  <p className="text-sm text-gray-900 font-medium">{job.job_type}</p>
                </div>
              </div>
            )}
            
            {job.techpark_name && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-sm text-gray-900 font-medium">{job.techpark_name}</p>
                </div>
              </div>
            )}
            
            {job.posted && job.posted !== 'unknown' && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Posted</p>
                  <p className="text-sm text-gray-900 font-medium">{job.posted}</p>
                </div>
              </div>
            )}
            
            {job.last_date && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Deadline</p>
                  <p className="text-sm text-gray-900 font-medium">{job.last_date}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        {job.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-black mb-4 pb-3 border-b border-gray-200">
              Job Description
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {job.description}
              </p>
            </div>
          </div>
        )}



        {/* Company Information */}
        <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            About {job.company_name}
          </h2>
          <div className="flex items-start gap-3 mb-4">
            <Building2 className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              {job.company_name} is actively hiring for this position. 
              Visit their career page to learn more about the company culture and opportunities.
            </p>
          </div>
        </div>

        {/* Application CTA */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="bg-black text-white p-6">
            <h3 className="text-lg font-semibold mb-2">
              Interested in this position?
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Click the button below to be redirected to the official application page.
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(job.link, '_blank')}
              className="w-full sm:w-auto bg-white text-black border-white hover:bg-gray-100"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              APPLY ON COMPANY WEBSITE
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Job Parker connects you with opportunities. Applications are processed directly by the hiring company.
          </p>
        </div>
      </div>
    </div>
  );
}
