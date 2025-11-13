import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'react-toastify';

const TeacherLogin = () => {
  const [classId, setClassId] = useState('');
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const { classes } = useData();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (classes[classId]) {
      // For this implementation, any email is accepted to simplify teacher "registration"
      // A real system would have teacher accounts managed by coordinators.
      toast.success(`Welcome! Logged into class ${classes[classId].name}`);
      login({ email, classId, role: 'teacher' });
    } else {
      toast.error("Invalid Class ID.");
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-violet-100 to-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-ggsipu-navy">Teacher Portal</h2>
          <p className="text-ggsipu-700 mt-2">Sign in with your Class ID and Email</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-ggsipu-navy font-semibold mb-2" htmlFor="classId">Class ID</label>
            <input
              type="text"
              id="classId"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white text-ggsipu-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ggsipu-gold focus:border-ggsipu-gold"
              placeholder="Enter your class ID"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-ggsipu-navy font-semibold mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white text-ggsipu-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ggsipu-gold focus:border-ggsipu-gold"
              placeholder="Enter your email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-ggsipu-navy text-white font-bold py-2 px-4 rounded-md hover:bg-ggsipu-700 transition duration-300 shadow-md flex items-center justify-center"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-6">
            <Link to="/" className="text-sm text-ggsipu-700 hover:text-ggsipu-navy hover:underline font-medium">
                &larr; Back to Role Selection
            </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;