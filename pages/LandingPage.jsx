
import React from 'react';
import { Link } from 'react-router-dom';

const RoleCard = ({ to, title, description, icon }) => (
  <Link
    to={to}
    className="bg-white/95 dark:bg-black/40 rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300 group backdrop-blur-sm"
    style={{
      /* ensure the card is slightly elevated above the hero background */
      border: '1px solid rgba(255,255,255,0.06)'
    }}
  >
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-yellow-300 dark:text-yellow-300 mb-2">{title}</h3>
    <p className="text-yellow-300 dark:text-yellow-300">{description}</p>
    <span className="mt-4 inline-block text-orange-400 font-semibold group-hover:underline">Enter Portal &rarr;</span>
  </Link>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen hero-bg flex flex-col items-center justify-center p-4">
      <header className="text-center mb-12 hero-content">
        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow text-yellow-300">
          Guru Gobind Singh Indraprastha University
        </h1>
        <p className="text-xl mt-2 text-orange-300">Academic Management Portal</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <RoleCard
          to="/coordinator-login"
          title="Coordinator"
          description="Manage classes, enroll students, and oversee academic operations."
          icon={
            <svg className="w-16 h-16 text-red-700 dark:text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <RoleCard
          to="/teacher-login"
          title="Teacher"
          description="Manage subjects, take attendance, record marks, and create assignments."
          icon={
            <svg className="w-16 h-16 text-red-700 dark:text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" />
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4m-2 4l-3 3m0 0l3 3m-3-3h10" />
            </svg>
          }
        />
        <RoleCard
          to="/student-login"
          title="Student"
          description="View your attendance, check marks, submit assignments, and track progress."
          icon={
            <svg className="w-16 h-16 text-red-700 dark:text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          }
        />
      </main>
    </div>
  );
};

export default LandingPage;

