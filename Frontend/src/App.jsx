import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Freshers from './pages/Freshers'
import ResumeJobs from './pages/ResumeJobs'
import Navbar from './components/layouts/Navbar'
import JobDetails from './pages/JobDetails'

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/freshers" element={<Freshers />} />
        <Route path="/resume-jobs" element={<ResumeJobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
      </Routes>

    </div>
  )
}

export default App