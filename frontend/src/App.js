import React , { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation , Navigate} from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientRecords from './components/PatientRecords';
import EmployeeRecords from './components/EmployeeRecords';
import PatientRegistration from './components/PatientRegistration';
import AlertHistory from './components/AlertHistory';

// Wrapper to conditionally show Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';
  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="main-content">{children}</div>
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Layout>
        <Routes>
        {/* Login route */}
        <Route path="/" element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />


        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dashboard/patient-records" 
          element={isLoggedIn ? <PatientRecords /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dashboard/employee-records" 
          element={isLoggedIn ? <EmployeeRecords /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dashboard/registration" 
          element={isLoggedIn ? <PatientRegistration /> : <Navigate to="/" />} 
        />
        <Route 
          path="/dashboard/alert-history" 
          element={isLoggedIn ? <AlertHistory /> : <Navigate to="/" />} 
        />
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;
