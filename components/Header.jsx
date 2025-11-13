import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="site-header sticky top-0 z-50 print:hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.jpg" alt="GGSIPU logo" className="h-16 w-auto mr-3" />
              <div>
                <h1 className="text-lg font-bold text-yellow-300">
                  GGSIPU
                </h1>
                <p className="text-xs font-medium" style={{ color: '#ffffff' }}>Academic Portal</p>
              </div>
            </Link>
          </div>
          {/* desktop nav */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-sm text-white hover:text-yellow-400">Home</Link>
            <Link to="/about" className="text-sm text-white hover:text-yellow-400">About</Link>
            <Link to="/contact" className="text-sm text-white hover:text-yellow-400">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center">
            {user ? (
              <>
                <span className="mr-4 text-sm capitalize text-white">Welcome, {user.role}</span>
                <button
                  onClick={logout}
                  className="btn-accent font-semibold py-2 px-4 rounded-md hover:opacity-95 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
                <div className="flex space-x-3">
                <Link to="/coordinator-login" className="text-sm text-white hover:text-yellow-400">Coordinator</Link>
                <Link to="/teacher-login" className="text-sm text-white hover:text-yellow-400">Teacher</Link>
                <Link to="/student-login" className="text-sm text-white hover:text-yellow-400">Student</Link>
              </div>
            )}
          </div>

          {/* mobile menu button */}
          <div className="md:hidden ml-2">
            <MobileMenu user={user} logout={logout} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

function MobileMenu({ user, logout }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-label="Toggle navigation"
        className="p-2 rounded-md border-2 border-yellow-300 bg-transparent text-yellow-300 hover:bg-yellow-300 hover:text-ggsipu-navy transition duration-300"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-ggsipu-navy border-2 border-yellow-300 rounded-md shadow-xl py-2 z-50">
          <Link to="/" className="block px-4 py-2 text-sm text-blue-400 hover:text-yellow-300 hover:underline hover:bg-opacity-30 hover:bg-blue-900 transition duration-200">Home</Link>
          <Link to="/about" className="block px-4 py-2 text-sm text-blue-400 hover:text-yellow-300 hover:underline hover:bg-opacity-30 hover:bg-blue-900 transition duration-200">About</Link>
          <Link to="/contact" className="block px-4 py-2 text-sm text-blue-400 hover:text-yellow-300 hover:underline hover:bg-opacity-30 hover:bg-blue-900 transition duration-200">Contact</Link>
          <div className="border-t border-yellow-300 my-1" />
          {user ? (
            <>
              <div className="px-4 py-2 text-sm text-blue-400">Signed as <strong className="capitalize">{user.role}</strong></div>
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:text-yellow-300 hover:underline hover:bg-opacity-30 hover:bg-blue-900 transition duration-200">Logout</button>
            </>
          ) : (
            <>
              <Link to="/coordinator-login" className="block px-4 py-2 text-sm text-blue-400 hover:text-yellow-300 hover:underline hover:bg-opacity-30 hover:bg-blue-900 transition duration-200">Coordinator Login</Link>
              <Link to="/teacher-login" className="block px-4 py-2 text-sm text-blue-400 hover:text-yellow-300 hover:underline hover:bg-opacity-30 hover:bg-blue-900 transition duration-200">Teacher Login</Link>
              <Link to="/student-login" className="block px-4 py-2 text-sm text-blue-400 hover:text-yellow-300 hover:underline hover:bg-opacity-30 hover:bg-blue-900 transition duration-200">Student Login</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}