import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiBriefcase, FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-white text-black border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <FiBriefcase className="text-2xl text-blue-600" />
            <span className="font-bold text-xl tracking-wide">Job Hunter</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:text-blue-600 hover:border-blue-600"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/freshers"
              onClick={closeMenu}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:text-blue-600 hover:border-blue-600"
                }`
              }
            >
              Freshers
            </NavLink>

            <NavLink
              to="/resume-jobs"
              onClick={closeMenu}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent hover:text-blue-600 hover:border-blue-600"
                }`
              }
            >
              Resume Jobs
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="focus:outline-none p-2 text-gray-700"
            >
              {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm border-b border-gray-200 ${
                  isActive ? "text-blue-600 font-medium" : "hover:text-blue-600"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/freshers"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm border-b border-gray-200 ${
                  isActive ? "text-blue-600 font-medium" : "hover:text-blue-600"
                }`
              }
            >
              Freshers
            </NavLink>

            <NavLink
              to="/resume-jobs"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm ${
                  isActive ? "text-blue-600 font-medium" : "hover:text-blue-600"
                }`
              }
            >
              Resume Jobs
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
