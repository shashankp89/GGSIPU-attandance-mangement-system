
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import CoordinatorLogin from './pages/coordinator/CoordinatorLogin';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentLogin from './pages/student/StudentLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import Footer from './components/Footer';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user || user.role !== role) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <HashRouter>
      <DataProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen font-sans text-gray-800 dark:text-gray-200">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Coordinator Routes */}
                <Route path="/coordinator-login" element={<CoordinatorLogin />} />
                <Route 
                  path="/coordinator" 
                  element={
                    <PrivateRoute role="coordinator">
                      <CoordinatorDashboard />
                    </PrivateRoute>
                  } 
                />
                
                {/* Teacher Routes */}
                <Route path="/teacher-login" element={<TeacherLogin />} />
                <Route 
                  path="/teacher" 
                  element={
                    <PrivateRoute role="teacher">
                      <TeacherDashboard />
                    </PrivateRoute>
                  } 
                />

                {/* Student Routes */}
                <Route path="/student-login" element={<StudentLogin />} />
                <Route 
                  path="/student" 
                  element={
                    <PrivateRoute role="student">
                      <StudentDashboard />
                    </PrivateRoute>
                  } 
                />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        </AuthProvider>
      </DataProvider>
    </HashRouter>
  );
}

export default App;