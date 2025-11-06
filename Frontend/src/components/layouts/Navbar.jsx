import React from 'react'
import { NavLink } from 'react-router-dom'
import { FiBriefcase } from 'react-icons/fi'

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <FiBriefcase className="text-2xl text-blue-600" />
            <span className="font-bold text-xl text-gray-900">Job Hunter</span>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/freshers" 
              className={({ isActive }) => 
                `px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`
              }
            >
              Freshers
            </NavLink>
            <NavLink 
              to="/resume-jobs" 
              className={({ isActive }) => 
                `px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-700 hover:text-blue-600'
                }`
              }
            >
              Resume Jobs
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar