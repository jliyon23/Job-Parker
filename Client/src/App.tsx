import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobList } from '@/components/JobList';
import { ResumeMatch } from '@/components/ResumeMatch';
import { Button } from '@/components/ui/button';
import { jobService } from '@/services/api';
import { Briefcase, UserCheck, FileText, RefreshCw } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleClearCache = () => {
    jobService.clearCache();
    setRefreshKey(prev => prev + 1);
    alert('Cache cleared! Data will be refreshed.');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="professional-header sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8  flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[#0a2463]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-black">JobPark</h1>
                <p className="text-xs text-gray-600">Professional Job Search Platform</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCache}
              className="gap-2 text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto p-0 bg-white border border-gray-300">
            <TabsTrigger 
              value="all" 
              className="flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-[#0a2463] data-[state=active]:text-white text-gray-700 border-r border-gray-300"
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">All Jobs</span>
              <span className="sm:hidden text-sm font-medium">All</span>
            </TabsTrigger>
            <TabsTrigger 
              value="freshers" 
              className="flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-[#0a2463] data-[state=active]:text-white text-gray-700 border-r border-gray-300"
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Freshers</span>
              <span className="sm:hidden text-sm font-medium">Fresh</span>
            </TabsTrigger>
            <TabsTrigger 
              value="resume" 
              className="flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-[#0a2463] data-[state=active]:text-white text-gray-700"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Resume Match</span>
              <span className="sm:hidden text-sm font-medium">Match</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-semibold text-black">Browse All Jobs</h2>
              <p className="text-sm text-gray-600 mt-1">
                Discover opportunities from top companies
              </p>
            </div>
            <JobList key={`all-${refreshKey}`} />
          </TabsContent>

          <TabsContent value="freshers" className="space-y-6">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-semibold text-black">Fresher Opportunities</h2>
              <p className="text-sm text-gray-600 mt-1">
                Perfect positions for those starting their career
              </p>
            </div>
            <JobList key={`freshers-${refreshKey}`} isFresher={true} />
          </TabsContent>

          <TabsContent value="resume" className="space-y-6">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-semibold text-black">Match Your Resume</h2>
              <p className="text-sm text-gray-600 mt-1">
                Find jobs that perfectly match your skills and experience
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <ResumeMatch />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16 py-6 bg-slate-100">
        <div className="container mx-auto px-6 text-center text-xs text-slate-500">
          <p>&copy; 2025 Job Parker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
