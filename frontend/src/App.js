import React , { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
          <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/patient-records" element={<PatientRecords />} />
          <Route path="/dashboard/employee-records" element={<EmployeeRecords />} />
          <Route path="/dashboard/registration" element={<PatientRegistration />} />
          <Route path="/dashboard/alert-history" element={<AlertHistory />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
