import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { toast } from 'react-toastify';

const CoordinatorLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login } = useAuth();
  const { coordinators, updateData } = useData();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      if (coordinators[email] && coordinators[email].password === password) {
        toast.success("Login successful!");
        login({ email, name: coordinators[email].name, role: 'coordinator' });
      } else {
        toast.error("Invalid email or password.");
      }
    } else {
      if (coordinators[email]) {
        toast.error("An account with this email already exists.");
      } else {
        const newCoordinators = { ...coordinators, [email]: { name, password } };
        updateData(prev => ({ ...prev, coordinators: newCoordinators }));
        toast.success("Registration successful! Please log in.");
        setIsLogin(true);
      }
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-100 to-cyan-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-ggsipu-navy">Coordinator Portal</h2>
          <p className="text-ggsipu-700 mt-2">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-ggsipu-navy font-semibold mb-2" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                autoComplete="name"
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white text-ggsipu-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ggsipu-gold focus:border-ggsipu-gold"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}
          <div className="mb-4">
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
          <div className="mb-6">
            <label className="block text-ggsipu-navy font-semibold mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              autoComplete={isLogin ? "current-password" : "new-password"}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-md bg-white text-ggsipu-navy placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ggsipu-gold focus:border-ggsipu-gold"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-ggsipu-navy text-white font-bold py-2 px-4 rounded-md hover:bg-ggsipu-700 transition duration-300 shadow-md flex items-center justify-center"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-ggsipu-700">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-ggsipu-navy font-semibold hover:underline">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
         <div className="text-center mt-4">
            <Link to="/" className="text-sm text-ggsipu-700 hover:text-ggsipu-navy hover:underline font-medium">
                &larr; Back to Role Selection
            </Link>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorLogin;
