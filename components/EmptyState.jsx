import React from 'react';

const EmptyState = ({ icon, message, children }) => {
  return (
    <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
      <div className="flex justify-center items-center mb-4">
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      {children}
    </div>
  );
};

export default EmptyState;
