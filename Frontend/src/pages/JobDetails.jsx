import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiClock, FiBriefcase, FiMapPin, FiExternalLink } from 'react-icons/fi';

// Helper to parse raw description into structured sections
function parseDescription(raw) {
  if (!raw) return [];
  // Normalize bullets by forcing newline before bullet symbols if missing
  let text = raw
    .replace(/\r/g, '')
    .replace(/\s*[•●]\s*/g, '\n• ') // unify bullet markers
    .replace(/\s*-\s+/g, '\n- ') // dash bullets
    .trim();

  // Ensure headings have their own line
  const headingKeywords = [
    'Responsibilities', 'Skills', 'Must Have', 'Should Have', 'Good to Have', 'Requirements', 'About the Role', 'Qualification', 'Job Title', 'Experience', 'Profile', 'Why Join Us'
  ];
  headingKeywords.forEach(h => {
    const re = new RegExp(`(?<!\n)${h}:`, 'g');
    text = text.replace(re, `\n${h}:`);
  });

  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const sections = [];
  let current = { heading: null, bullets: [], paragraphs: [] };

  const commit = () => {
    if (current.heading || current.bullets.length || current.paragraphs.length) {
      sections.push(current);
    }
    current = { heading: null, bullets: [], paragraphs: [] };
  };

  lines.forEach(line => {
    // Heading line (ends with ':' or matches keyword + ':')
    if (/^[A-Z][A-Za-z0-9 /()&.-]*:$/i.test(line)) {
      commit();
      current.heading = line.replace(/:$/, '');
      return;
    }
    // Bullet line
    if (/^[•\-]\s+/.test(line)) {
      current.bullets.push(line.replace(/^[•\-]\s+/, ''));
      return;
    }
    // Sometimes bullets remain with leading symbol in middle of sentence (e.g., "• item")
    if (/^\*\s+/.test(line)) {
      current.bullets.push(line.replace(/^\*\s+/, ''));
      return;
    }
    // If line contains multiple inline bullets, split them
    if (line.includes('• ')) {
      line.split(/•\s+/).filter(Boolean).forEach((part, idx) => {
        if (idx === 0 && !/^\s*$/.test(part)) {
          current.paragraphs.push(part.trim());
        } else {
          current.bullets.push(part.trim());
        }
      });
      return;
    }
    // Otherwise paragraph
    current.paragraphs.push(line);
  });
  commit();

  return sections;
}

const CACHE_KEY = 'job-details-cache-v1';

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCacheEntry(id, data) {
  try {
    const cache = getCache();
    cache[id] = { data, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

function getCachedEntry(id, maxAgeMs = 1000 * 60 * 10) { // 10 minutes
  const cache = getCache();
  const entry = cache[id];
  if (!entry) return null;
  if (Date.now() - entry.ts > maxAgeMs) return null;
  return entry.data;
}

const JobDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const jobFromState = location.state?.job;

  const [job, setJob] = useState(jobFromState || getCachedEntry(id));
  const [loading, setLoading] = useState(!job);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have job from state or cache, don't refetch.
    if (job) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://job-parker-api.vercel.app/api/jobs/${id}`);
        if (!mounted) return;
        setJob(res.data);
        setCacheEntry(id, res.data);
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load job');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id, job]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 animate-pulse">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-200 p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2">Job Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">The job you are looking for does not exist or has been removed.</p>
          <Link to="/" className="inline-flex items-center text-blue-600 hover:underline text-sm">
            <FiArrowLeft className="mr-1" /> Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const sections = parseDescription(job.description);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:underline text-sm font-medium">
            <FiArrowLeft className="mr-1" /> Back to Listings
          </Link>
          {job.is_fresher && (
            <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1">FRESHER FRIENDLY</span>
          )}
        </div>

        <div className="bg-white border border-gray-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{job.role}</h1>
              <div className="flex items-center text-gray-600 mb-2">
                <FiBriefcase className="mr-2" />
                <span className="font-medium">{job.company_name}</span>
              </div>
              {job.techpark_name && (
                <div className="flex items-center text-gray-600 mb-2">
                  <FiMapPin className="mr-2" />
                  <span>{job.techpark_name}</span>
                </div>
              )}
              {job.last_date && (
                <div className="flex items-center text-red-600 text-sm">
                  <FiClock className="mr-2" /> Last Date: {new Date(job.last_date).toLocaleDateString()}
                </div>
              )}
            </div>
            {job.logo && (
              <div className="shrink-0 flex justify-center sm:justify-end">
                <img
                  src={job.logo}
                  alt={`${job.company_name} logo`}
                  className="h-20 object-contain"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              </div>
            )}
          </div>

          <div className="space-y-6 text-sm sm:text-base">
            {sections.length === 0 ? (
              <div className="text-gray-500 italic">No detailed description available.</div>
            ) : (
              sections.map((sec, i) => (
                <div key={i} className="border-b last:border-b-0 border-gray-100 pb-4 last:pb-0">
                  {sec.heading && (
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                      {sec.heading}
                    </h2>
                  )}
                  {sec.paragraphs.map((p, idx) => (
                    <p key={idx} className="text-gray-700 leading-relaxed mb-2 last:mb-0">{p}</p>
                  ))}
                  {sec.bullets.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      {sec.bullets.map((b, idx) => (
                        <li key={idx} className="text-gray-700 leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-8">
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-medium"
            >
              Apply Now <FiExternalLink className="ml-2" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
