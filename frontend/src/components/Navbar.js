import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h1>Hospital Dashboard</h1>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active-link' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/patient-records" className={({ isActive }) => isActive ? 'active-link' : ''}>
            Patient Records
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/employee-records" className={({ isActive }) => isActive ? 'active-link' : ''}>
            Employee Records
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/registration" className={({ isActive }) => isActive ? 'active-link' : ''}>
            Add Patient
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard/alert-history" className={({ isActive }) => isActive ? 'active-link' : ''}>
            Alert History
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
