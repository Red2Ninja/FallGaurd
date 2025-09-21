import React, { useState } from 'react';
import { User, Eye, Search } from 'lucide-react';
import './PatientRecords.css'; // Import the CSS file

const PatientRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const patients = [
    { id: '#121826', name: 'Lane', age: '65', room: 'A-101', riskLevel: '00C9A7', status: 'Stable', action: 'View', actionColor: 'green', avatar: '' },
    { id: '#121846', name: 'Johnson', age: '72', room: 'B-205', riskLevel: '4D7CFF', status: 'Medium', action: 'Monitor', actionColor: 'yellow', avatar: '' },
    { id: '#121896', name: 'Smith', age: '58', room: 'C-303', riskLevel: '4D7CFF', status: 'High', action: 'Alert', actionColor: 'red', avatar: '' },
    { id: '#121876', name: 'Davis', age: '81', room: 'A-102', riskLevel: '4D7CFF', status: 'High', action: 'Critical', actionColor: 'red-dark', avatar: '' },
    { id: '#121906', name: 'Wilson', age: '69', room: 'B-206', riskLevel: '4D7CFF', status: 'Medium', action: 'Watch', actionColor: 'yellow-dark', avatar: '' },
    { id: '#121936', name: 'Brown', age: '77', room: 'C-304', riskLevel: '4D7CFF', status: 'Stable', action: 'Routine', actionColor: 'blue', avatar: '' },
    { id: '#121966', name: 'Taylor', age: '63', room: 'A-103', riskLevel: '4D7CFF', status: 'Medium', action: 'Review', actionColor: 'blue-dark', avatar: '' },
    { id: '#121996', name: 'Anderson', age: '75', room: 'B-207', riskLevel: '4D7CFF', status: 'High', action: 'Urgent', actionColor: 'red-dark', avatar: '' },
  ];

  const getRiskColor = (riskLevel) => {
    if (riskLevel === '00C9A7') return 'green-gradient';
    return 'yellow-red-gradient';
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="patient-records-container">
      {/* Header */}
      <div className="header">
        <h2>Patient Records</h2>
        <div className="search-filter">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="stable">Stable</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Room Number</th>
              <th>Risk Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr key={index}>
                <td>
                  <div className="id-cell">
                    <div className="avatar">
                      <User />
                    </div>
                    <span>{patient.id}</span>
                  </div>
                </td>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.room}</td>
                <td>
                  <div className="risk-cell">
                    <div className={`risk-bar ${getRiskColor(patient.riskLevel)}`}>
                      <div className="risk-dot"></div>
                    </div>
                    <span>#{patient.riskLevel}</span>
                  </div>
                </td>
                <td>
                  <button className={`action-btn ${patient.actionColor}`}>
                    <Eye /> {patient.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="card">
          <h3>Total Patients</h3>
          <p>{patients.length}</p>
        </div>
        <div className="card high-risk">
          <h3>High Risk</h3>
          <p>{patients.filter(p => p.status === 'High').length}</p>
        </div>
        <div className="card medium-risk">
          <h3>Medium Risk</h3>
          <p>{patients.filter(p => p.status === 'Medium').length}</p>
        </div>
        <div className="card stable">
          <h3>Stable</h3>
          <p>{patients.filter(p => p.status === 'Stable').length}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
