import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiFileText, FiCalendar, FiClock, FiBriefcase, FiExternalLink, FiLoader, FiUpload } from "react-icons/fi";
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.mjs';
import JobCard from "../components/JobCard";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

const API_BASE = 'https://job-parker-api.vercel.app';

// Cache helpers for matched resume results
const MATCH_CACHE_KEY = 'resume-match-cache-v1';
const MATCH_TTL_MS = 1000 * 60 * 10; // 10 minutes
function loadMatchCache() { try { return JSON.parse(localStorage.getItem(MATCH_CACHE_KEY)) || {}; } catch { return {}; } }
function saveMatchCache(cache) { try { localStorage.setItem(MATCH_CACHE_KEY, JSON.stringify(cache)); } catch {} }
function cacheKey(textHash) { return textHash; }
function hashText(str) { return btoa(unescape(encodeURIComponent(str.slice(0, 5000)))); }
function getCachedMatches(textHash) {
  const cache = loadMatchCache();
  const entry = cache[textHash];
  if (!entry) return null;
  if (Date.now() - entry.ts > MATCH_TTL_MS) return null;
  return entry.data;
}
function setCachedMatches(textHash, data) {
  const cache = loadMatchCache();
  cache[textHash] = { ts: Date.now(), data };
  saveMatchCache(cache);
}

// Cache helpers for resume jobs list
const RESUME_LIST_CACHE_KEY = 'resume-jobs-cache-v1';
const RESUME_LIST_TTL_MS = 1000 * 60 * 5; // 5 minutes
function loadResumeCache() { try { return JSON.parse(localStorage.getItem(RESUME_LIST_CACHE_KEY)) || {}; } catch { return {}; } }
function saveResumeCache(cache) { try { localStorage.setItem(RESUME_LIST_CACHE_KEY, JSON.stringify(cache)); } catch {} }
function getResumeCached() {
  const cache = loadResumeCache();
  if (!cache.ts || (Date.now() - cache.ts) > RESUME_LIST_TTL_MS) return null;
  return cache.data || null;
}
function setResumeCached(data) {
  saveResumeCache({ ts: Date.now(), data });
}

// Persist last resume match state
const LAST_RESUME_STATE_KEY = 'resume-last-state-v1';
function saveResumeState(state) {
  try { localStorage.setItem(LAST_RESUME_STATE_KEY, JSON.stringify(state)); } catch {}
}
function loadResumeState() {
  try {
    const raw = localStorage.getItem(LAST_RESUME_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function clearResumeState() { try { localStorage.removeItem(LAST_RESUME_STATE_KEY); } catch {} }

const ResumeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [processingStage, setProcessingStage] = useState('idle'); // idle|reading|extracting|matching
  const [resumePreview, setResumePreview] = useState('');
  const fileInputRef = useRef(null);

  // Restore previously matched resume (matches & preview) on mount
  useEffect(() => {
    const prev = loadResumeState();
    if (prev && Array.isArray(prev.matches) && prev.matches.length) {
      setMatches(prev.matches);
      setResumePreview(prev.preview || '');
      setProcessingStage('done');
    }
  }, []);

  useEffect(() => {
    const fetchResumeJobs = async () => {
      try {
        const cached = getResumeCached();
        if (cached) {
          setJobs(cached);
          setLoading(false);
          // background revalidate
          revalidateResumeJobs();
          return;
        }
        await revalidateResumeJobs();
      } catch (error) {
        console.error("❌ Error fetching resume jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    const revalidateResumeJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/jobs`, { params: { search: 'resume', page: 1, limit: 100 } });
        const list = Array.isArray(response.data?.data) ? response.data.data : response.data;
        setJobs(list || []);
        setResumeCached(list || []);
      } catch (error) {
        console.error("❌ Error revalidating resume jobs:", error);
      }
    };
    fetchResumeJobs();
  }, []);

  const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      setProcessingStage(`extracting page ${i}/${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => ('str' in item ? item.str : '')).filter(Boolean);
      text += strings.join(' ') + '\n';
    }
    return text.replace(/\s+/g, ' ').trim();
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    try {
      setUploading(true);
      setProcessingStage('reading');
      const text = await extractPdfText(file);
      setProcessingStage('parsed');
      setResumePreview(text.slice(0, 500));
      if (!text || text.length < 50) {
        alert('Resume text seems too short or could not be extracted.');
        return;
      }
      const h = hashText(text);
      const cached = getCachedMatches(h);
      if (cached) {
        setMatches(cached.matches);
        setProcessingStage('cached');
        setUploading(false);
        saveResumeState({ hash: h, preview: text.slice(0, 500), matches: cached.matches });
        return;
      }
      setProcessingStage('matching');
      const res = await axios.post(`${API_BASE}/api/jobs/match-resume-text`, { text });
      const received = res.data?.matches || [];
      received.sort((a, b) => (b.score || 0) - (a.score || 0));
      setMatches(received);
      setCachedMatches(h, { matches: received });
      setProcessingStage('done');
      saveResumeState({ hash: h, preview: text.slice(0, 500), matches: received });
    } catch (err) {
      console.error('❌ Error processing resume:', err);
      alert('Failed to process resume.');
      setProcessingStage('error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearMatches = () => {
    setMatches([]);
    setResumePreview('');
    setProcessingStage('idle');
    clearResumeState();
  };

  const renderProcessingStatus = () => {
    if (!uploading && processingStage === 'idle') return null;
    const stageTextMap = {
      reading: 'Reading PDF…',
      parsed: 'PDF parsed, preparing match…',
      matching: 'Matching jobs…',
      done: 'Matches ready!',
      cached: 'Loaded cached matches',
      error: 'Error processing resume',
    };
    return (
      <div className="flex items-center space-x-2 text-sm text-blue-600 mb-4">
        <FiLoader className={`text-base ${processingStage === 'done' ? '' : 'animate-spin'}`} />
        <span>{stageTextMap[processingStage] || processingStage}</span>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex items-center space-x-2 text-blue-600">
        <FiLoader className="animate-spin text-2xl" />
        <span className="text-lg font-medium">Loading resume-based jobs...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <FiFileText className="text-blue-600 text-2xl" />
            <h1 className="text-2xl sm:text-3xl font-bold">Resume-Based Jobs</h1>
          </div>
          <p className="text-gray-600">Upload your resume to get job suggestions.</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 sm:p-6 mb-8">
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
          >
            {uploading ? 'Processing…' : 'Upload Resume (PDF)'}
          </button>
          {matches.length > 0 && (
            <button
              onClick={handleClearMatches}
              className="ml-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 text-xs"
            >
              Clear Matches
            </button>
          )}
          {renderProcessingStatus()}
          {resumePreview && (
            <div className="mt-4 bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 whitespace-pre-line max-h-40 overflow-auto">
              <strong className="block mb-1">Preview:</strong>
              {resumePreview}...
            </div>
          )}
        </div>

        {matches.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Suggested Matches ({matches.length})</h2>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((job) => (
                <div key={job._id || job.job_id} className="relative">
                  <div className="absolute top-2 right-2 bg-blue-50 text-blue-600 text-xs font-medium px-2 py-1 rounded">
                    {(job.score * 100).toFixed(0)}%
                  </div>
                  <JobCard job={job} accent="blue" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">All Resume Required Jobs</h2>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white border border-gray-200 max-w-md mx-auto p-8">
                <FiUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No resume jobs found</h3>
                <p className="text-gray-600">Check back later for new opportunities</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} accent="blue" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeJobs;