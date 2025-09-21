import React, { useState } from 'react';
import { Search, AlertTriangle, Clock, User, MapPin } from 'lucide-react';
import './AlertHistory.css'; // Import the CSS file

const AlertHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const alerts = [
    { alertId: 'ALT-001', datetime: '2024-01-15 14:30:25', patient: 'John Doe', room: '#R00107', responseTime: '2m 15s', responder: 'Dr. Smith', status: 'Resolved', type: 'Fall Detected', severity: 'High' },
    { alertId: 'ALT-002', datetime: '2024-01-15 12:45:10', patient: 'Mary Johnson', room: '#121826', responseTime: '1m 45s', responder: 'Nurse Davis', status: 'In Progress', type: 'Movement Anomaly', severity: 'Medium' },
    { alertId: 'ALT-003', datetime: '2024-01-15 11:20:33', patient: 'Robert Wilson', room: '#021826', responseTime: '3m 02s', responder: 'Dr. Progress', status: 'Critical', type: 'Fall Detected', severity: 'Critical' },
    { alertId: 'ALT-004', datetime: '2024-01-15 10:15:45', patient: 'Linda Brown', room: '#021018', responseTime: '1m 30s', responder: 'Nurse Wilson', status: 'Critical', type: 'Movement Anomaly', severity: 'High' },
    { alertId: 'ALT-005', datetime: '2024-01-15 09:55:12', patient: 'James Davis', room: '#021826', responseTime: '2m 45s', responder: 'Dr. Johnson', status: 'Critical', type: 'Fall Detected', severity: 'Critical' },
    { alertId: 'ALT-006', datetime: '2024-01-15 08:30:20', patient: 'Patricia Miller', room: '#021826', responseTime: '4m 10s', responder: 'Nurse Taylor', status: 'Warning', type: 'Irregular Movement', severity: 'Low' },
    { alertId: 'ALT-007', datetime: '2024-01-15 07:45:33', patient: 'Michael Anderson', room: '#171826', responseTime: '1m 55s', responder: 'Dr. White', status: 'Critical', type: 'Fall Risk Assessment', severity: 'High' },
    { alertId: 'ALT-008', datetime: '2024-01-15 06:20:15', patient: 'Sarah Thompson', room: '#021218', responseTime: '3m 30s', responder: 'Emergency Team', status: 'Warning', type: 'Movement Alert', severity: 'Medium' }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'status-resolved';
      case 'in progress': return 'status-progress';
      case 'critical': return 'status-critical';
      case 'warning': return 'status-warning';
      default: return 'status-default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'severity-low';
      case 'medium': return 'severity-medium';
      case 'high': return 'severity-high';
      case 'critical': return 'severity-critical';
      default: return 'severity-default';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchSearch = alert.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.alertId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        alert.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || alert.status.toLowerCase() === filterStatus.toLowerCase();
    const matchType = filterType === 'all' || alert.type.toLowerCase() === filterType.toLowerCase();
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="alert-history-container">
      {/* Header */}
      <div className="header">
        <h2>Alert History</h2>
        <p>System Alert Monitoring and Response Log</p>
      </div>

      {/* Search + Filters */}
      <div className="filters-container">
        <div className="search-filters">
          <div className="search-box">
            <Search className="icon" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="resolved">Resolved</option>
            <option value="in progress">In Progress</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="fall detected">Fall Detected</option>
            <option value="movement anomaly">Movement Anomaly</option>
            <option value="irregular movement">Irregular Movement</option>
            <option value="fall risk">Fall Risk</option>
          </select>
        </div>
        <div className="actions-buttons">
          <button className="btn-export">Export Report</button>
          <button className="btn-print">Print History</button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Room</th>
              <th>Responder</th>
              <th>Response Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan="9" className="no-data">No alerts found.</td>
              </tr>
            )}
            {filteredAlerts.map(alert => (
              <tr key={alert.alertId}>
                <td>{alert.alertId}</td>
                <td><Clock className="icon" /> {alert.datetime}</td>
                <td><User className="icon" /> {alert.patient}</td>
                <td><MapPin className="icon" /> {alert.room}</td>
                <td>{alert.responder}</td>
                <td>{alert.responseTime}</td>
                <td>{alert.type}</td>
                <td><span className={`status ${getStatusColor(alert.status)}`}>{alert.status}</span></td>
                <td className={`severity ${getSeverityColor(alert.severity)}`}>{alert.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Stats */}
      <div className="stats-container">
        {[
          { label: 'Total Alerts', value: alerts.length },
          { label: 'Critical', value: alerts.filter(a => a.status === 'Critical').length },
          { label: 'Resolved', value: alerts.filter(a => a.status === 'Resolved').length },
          { label: 'In Progress', value: alerts.filter(a => a.status === 'In Progress').length },
        ].map(card => (
          <div key={card.label} className="stats-card">
            <AlertTriangle className="icon" />
            <span className="value">{card.value}</span>
            <span className="label">{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertHistory;
