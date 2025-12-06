import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Job } from '@/services/api';
import { Building2, Briefcase, Calendar, ExternalLink, MapPin, Eye } from 'lucide-react';

interface JobCardProps {
  job: Job;
  matchScore?: number;
  matchedSkills?: string[];
  onViewDetails?: (job: Job) => void;
}

export function JobCard({ job, matchScore, matchedSkills, onViewDetails }: JobCardProps) {
  return (
    <Card className="professional-card flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1 min-w-0">
            {job.logo && (
              <div className="w-10 h-10 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 bg-white">
                <img 
                  src={job.logo} 
                  alt={job.company_name}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base mb-1 truncate break-words text-black font-semibold">{job.role}</CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap text-gray-600 text-sm">
                <span className="flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{job.company_name}</span>
                </span>
              </CardDescription>
            </div>
          </div>
          {matchScore !== undefined && (
            <div className="flex-shrink-0 bg-[#0a2463] px-2 py-1 text-xs font-medium whitespace-nowrap text-white">
              {matchScore}% MATCH
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 flex-1 pt-0">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {job.job_type && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{job.job_type}</span>
            </span>
          )}
          {job.posted && job.posted !== 'unknown' && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{job.posted}</span>
            </span>
          )}
          {job.techpark_name && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{job.techpark_name}</span>
            </span>
          )}
        </div>

        {job.is_fresher && (
          <div className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-green-50 border border-green-300 text-green-700 uppercase tracking-wide">
            FRESHER FRIENDLY
          </div>
        )}

        {job.last_date && (
          <p className="text-xs text-gray-500 break-words">
            Application Deadline: {job.last_date}
          </p>
        )}

        {job.description && (
          <p className="text-sm text-gray-600 line-clamp-3 break-words leading-relaxed">
            {job.description}
          </p>
        )}

        {matchedSkills && matchedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
            {matchedSkills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] uppercase tracking-wide font-medium break-words"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="mt-auto pt-3 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-xs font-medium h-9"
              onClick={() => onViewDetails(job)}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">VIEW DETAILS</span>
              <span className="sm:hidden">DETAILS</span>
            </Button>
          )}
          <Button 
            variant="default"
            size="sm"
            className={`text-xs font-medium h-9 ${onViewDetails ? 'flex-1' : 'w-full'}`}
            onClick={() => window.open(job.link, '_blank')}
          >
            <span className="hidden sm:inline">APPLY NOW</span>
            <span className="sm:hidden">APPLY</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
