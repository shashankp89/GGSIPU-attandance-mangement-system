import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'react-toastify';

const StudentLogin = () => {
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const { login } = useAuth();
  const { classes } = useData();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    let studentFound = null;
    let classIdFound = null;

    for (const classId in classes) {
      const student = classes[classId].students.find(s => s.enrollmentNo === enrollmentNo);
      if (student) {
        studentFound = student;
        classIdFound = classId;
        break;
      }
    }

    if (studentFound) {
      toast.success(`Welcome, ${studentFound.name}!`);
      login({ ...studentFound, classId: classIdFound, role: 'student' });
    } else {
      toast.error("Invalid Enrollment Number.");
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-ggsipu-navy">Student Portal</h2>
          <p className="text-ggsipu-700 mt-2">Sign in with your Enrollment Number</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-ggsipu-navy font-semibold mb-2" htmlFor="enrollmentNo">Enrollment Number</label>
            <input
              type="text"
              id="enrollmentNo"
              value={enrollmentNo}
              onChange={(e) => setEnrollmentNo(e.target.value)}
              autoComplete="username"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white text-ggsipu-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ggsipu-gold focus:border-ggsipu-gold"
              placeholder="Enter your enrollment number"
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

export default StudentLogin;
