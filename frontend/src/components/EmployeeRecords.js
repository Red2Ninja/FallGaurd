import React, { useState } from 'react';
import { User, Search, Filter, Clock, UserCheck } from 'lucide-react';
import './EmployeeRecords.css'; // Import the CSS file

const EmployeeRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const employees = [
    { id: '#121836', name: 'Dr. Yamamoto', role: 'Cardiologist', department: 'Cardiology', shiftStatus: true, status: 'Active', shift: '08:00 - 16:00', action: 'Active', actionColor: 'green' },
    { id: '#0B101B', name: 'Nurse Jennifer', role: 'Head Nurse', department: 'Emergency', shiftStatus: true, status: 'Active', shift: '16:00 - 00:00', action: 'On Duty', actionColor: 'cyan' },
    { id: '#0B018', name: 'Dr. Francis', role: 'Neurologist', department: 'Neurology', shiftStatus: false, status: 'Off Duty', shift: 'Off', action: 'Off Duty', actionColor: 'gray' },
    { id: '#0B9A7', name: 'Nurse Patricia', role: 'ICU Nurse', department: 'ICU', shiftStatus: false, status: 'Off Duty', shift: 'Off', action: 'Off Duty', actionColor: 'gray' },
    { id: '#0B9A8', name: 'Dr. Martinez', role: 'Surgeon', department: 'Surgery', shiftStatus: false, status: 'Surgery', shift: 'In Operation', action: 'Busy', actionColor: 'red' },
    { id: '#0B101C', name: 'Tech Williams', role: 'Lab Technician', department: 'Laboratory', shiftStatus: true, status: 'Active', shift: '00:00 - 08:00', action: 'Night Shift', actionColor: 'blue' }
  ];

  const departments = ['all', 'Cardiology', 'Emergency', 'Neurology', 'ICU', 'Surgery', 'Laboratory'];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="employee-records-container">
      {/* Header */}
      <div className="header">
        <div>
          <h2>Employee Records</h2>
          <p>Medical Staff Management</p>
        </div>

        <div className="controls">
          <div className="search-filter">
            <div className="search-box">
              <Search className="icon" />
              <input 
                type="text" 
                placeholder="Search employees..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          <button className="add-employee-btn">
            <UserCheck className="icon" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Shift Status</th>
              <th>Shift Duration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp, idx) => (
              <tr key={idx}>
                <td>
                  <div className="id-cell">
                    <input type="checkbox" className="checkbox" />
                    <span>{emp.id}</span>
                  </div>
                </td>
                <td>
                  <div className="name-cell">
                    <div className="avatar"><User className="icon" /></div>
                    <span>{emp.name}</span>
                  </div>
                </td>
                <td>{emp.role}</td>
                <td>{emp.department}</td>
                <td>
                  <div className={`shift-toggle ${emp.shiftStatus ? 'active' : ''}`}>
                    <div className="toggle-dot"></div>
                  </div>
                </td>
                <td className={emp.shiftStatus ? 'text-green' : 'text-gray'}>{emp.shift}</td>
                <td>
                  <button className={`action-btn ${emp.actionColor}`}>{emp.action}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Department Stats */}
      <div className="stats-grid">
        {departments.slice(1).map(dept => {
          const deptCount = employees.filter(e => e.department === dept).length;
          const activeCount = employees.filter(e => e.department === dept && e.shiftStatus).length;
          return (
            <div key={dept} className="stats-card">
              <h3>{dept}</h3>
              <div className="stats-counts">
                <span>{deptCount}</span>
                <span className="text-green">{activeCount} active</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="quick-btn blue"><Clock className="icon" />Schedule Shift</button>
          <button className="quick-btn green"><UserCheck className="icon" />Mark Attendance</button>
          <button className="quick-btn purple"><Filter className="icon" />Generate Report</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRecords;
