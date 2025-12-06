import { useState, useRef } from 'react';
import { jobService } from '@/services/api';
import type { MatchedJob, Job } from '@/services/api';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/JobCard';
import { JobDetails } from '@/components/JobDetails';
import { Loader2, Search, FileText, Upload, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.mjs';

// Configure PDF.js worker - use local import path like in your working version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export function ResumeMatch() {
  const [resumeText, setResumeText] = useState('');
  const [matches, setMatches] = useState<MatchedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    extractTextFromFile(file);
  };

  const extractTextFromFile = async (file: File) => {
    setExtracting(true);
    try {
      if (file.type === 'text/plain') {
        // For text files, just read the content
        const text = await file.text();
        setResumeText(text);
      } else if (file.type === 'application/pdf') {
        // For PDF files, use pdfjs-dist for proper extraction (matching your working code)
        try {
          // Read file as ArrayBuffer
          const arrayBuffer = await file.arrayBuffer();
          
          console.log('Loading PDF document...');
          // Load PDF document (same as your working code)
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
          
          // Extract text from all pages (matching your working extractPdfText function)
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`Extracting page ${i}/${pdf.numPages}...`);
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => ('str' in item ? item.str : '')).filter(Boolean);
            text += strings.join(' ') + '\n';
          }
          
          // Clean up text (normalize whitespace)
          const cleanedText = text.replace(/\s+/g, ' ').trim();
          console.log(`Extracted text length: ${cleanedText.length} characters`);
          
          if (cleanedText.length > 50) {
            setResumeText(cleanedText);
            console.log('✅ PDF text extraction successful');
          } else {
            throw new Error('Resume text seems too short or could not be extracted');
          }
        } catch (pdfError) {
          console.error('PDF extraction error:', pdfError);
          const errorMessage = pdfError instanceof Error ? pdfError.message : 'Unknown error';
          alert(`Failed to extract text from PDF: ${errorMessage}\n\nPlease try:\n1. A different PDF file\n2. Converting to text/DOCX first\n3. Or manually paste your resume text below`);
          setUploadedFile(null);
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For DOCX files, use mammoth
        try {
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          console.log('Extracting DOCX text...');
          const result = await mammoth.extractRawText({ arrayBuffer });
          
          const cleanedText = result.value.trim();
          console.log(`Extracted DOCX text length: ${cleanedText.length} characters`);
          
          if (cleanedText.length > 50) {
            setResumeText(cleanedText);
            console.log('✅ DOCX text extraction successful');
          } else {
            throw new Error('Extracted text is too short or empty');
          }
        } catch (docxError) {
          console.error('DOCX extraction error:', docxError);
          alert('Failed to extract text from Word document. Please try converting to PDF or paste your resume text manually.');
          setUploadedFile(null);
        }
      } else {
        // For older DOC files, inform user to convert or paste text
        alert('For older Word (.doc) files, please convert to PDF or DOCX first, or paste your resume text manually.');
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please try again or paste your resume text manually.');
      setUploadedFile(null);
    } finally {
      setExtracting(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setResumeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = async () => {
    if (!resumeText.trim()) return;

    setLoading(true);
    try {
      const response = await jobService.matchResumeText(resumeText);
      setMatches(response.matches);
      setSearched(true);
    } catch (error) {
      console.error('Error matching resume:', error);
      alert('Failed to match resume. Please try again.');
    } finally {
      setLoading(false);
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
      <div className="professional-section p-6 space-y-4">
        <div className="flex items-start gap-3 text-slate-700 border-b border-slate-200 pb-3">
          <Upload className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">Resume Matching</p>
            <p className="text-xs text-slate-600">
              Upload your resume to find jobs that match your skills and experience
            </p>
          </div>
        </div>
        
        {/* File Upload Area */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="resume-upload"
          />
          
          {!uploadedFile ? (
            <label
              htmlFor="resume-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white cursor-pointer transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-slate-400" />
                <p className="mb-2 text-sm text-slate-700 font-medium">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500">
                  PDF, DOC, DOCX, or TXT (MAX. 5MB)
                </p>
              </div>
            </label>
          ) : (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {extracting && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extracting text from resume...</span>
            </div>
          )}

          {/* Manual text input as fallback */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span>Or paste your resume text</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (uploadedFile && e.target.value !== resumeText) {
                  // Clear uploaded file if user manually edits text
                  setUploadedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }
              }}
              placeholder="Paste your resume text here if file upload doesn't work..."
              className="w-full h-32 px-3 py-2 text-sm border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500">
              {resumeText.length} characters {resumeText.length > 0 && `(${Math.ceil(resumeText.split(/\s+/).filter(w => w.length > 0).length)} words)`}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSearch} 
          disabled={loading || !resumeText.trim() || extracting}
          size="lg"
          className="w-full sm:w-auto text-sm font-medium px-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              FINDING MATCHES...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              FIND MATCHING JOBS
            </>
          )}
        </Button>
      </div>

      {searched && (
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <h2 className="text-xl font-semibold text-black">
              {matches.length > 0 ? `${matches.length} Matching Jobs Found` : 'No Matches Found'}
            </h2>
          </div>

          {matches.length === 0 ? (
            <div className="professional-section p-12 text-center text-gray-600">
              <p className="text-base font-medium">No jobs match your resume at this time.</p>
              <p className="text-sm mt-2">Try updating your resume or check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  matchScore={job.matchScore}
                  matchedSkills={job.matchedSkills}
                  onViewDetails={(job) => setSelectedJob(job)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
