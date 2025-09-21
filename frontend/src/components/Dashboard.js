import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Play, 
  Square, 
  Download,
  AlertTriangle,
  Eye,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import './Dashboard.css'; // Import the CSS

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [emails, setEmails] = useState('');
  const [duration, setDuration] = useState(10);
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const API_BASE = "http://127.0.0.1:8000";

  const recentAlerts = [
    { id: '#111836', patient: 'Patient Name', room: '13:15', statusText: 'Stable', color: 'cyan' },
    { id: '#0B101B', patient: 'Patient Name', room: '2:17', statusText: 'Warning', color: 'yellow' },
    { id: '#171876', patient: 'Recent Name', room: '12:13', statusText: 'Critical', color: 'red' },
  ];

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Camera error:', err));
  }, []);

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const processVideo = async () => {
    if (!file || !emails) return alert('Please select a video and enter email addresses');

    setLoading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("emails", emails);

    try {
      const res = await axios.post(`${API_BASE}/upload-video/`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
    setLoading(false);
  };

  const startRecording = async () => {
    if (!emails) return alert('Please enter email addresses');
    setIsRecording(true); setLoading(true);

    const formData = new FormData();
    formData.append("emails", emails);
    formData.append("duration", duration);

    try {
      const res = await axios.post(`${API_BASE}/record-webcam/`, formData);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Webcam recording failed!");
    }

    setTimeout(() => { setIsRecording(false); setLoading(false); }, duration * 1000);
  };

  const stopRecording = () => { setIsRecording(false); setLoading(false); };

  return (
    <div className="dashboard-container">
      <div className="video-panel">
        <div className="video-wrapper">
          <video ref={videoRef} autoPlay muted className="video-element" />
          <div className="live-indicator">
            <div className="live-dot"></div>
            <span>Live Feed - Room A1</span>
          </div>
          {isRecording && (
            <div className="recording-indicator">
              <div className="live-dot"></div>
              <span>Recording</span>
            </div>
          )}
        </div>
      </div>

      <div className="control-panels">
        <div className="video-upload-panel">
          <h3><Upload /> Video Analysis</h3>
          <input type="file" accept="video/*" onChange={handleFileUpload} />
          {file && <p>Selected: {file.name}</p>}
          <input type="text" placeholder="Emails..." value={emails} onChange={(e) => setEmails(e.target.value)} />
          <button onClick={processVideo} disabled={loading}>{loading ? 'Processing...' : 'Process Video'}</button>
        </div>

        <div className="live-record-panel">
          <h3><Camera /> Live Recording</h3>
          <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min="5" max="300" />
          <div className="record-buttons">
            <button onClick={startRecording} disabled={isRecording || loading}><Play /> Start Recording</button>
            <button onClick={stopRecording} disabled={!isRecording}><Square /> Stop</button>
          </div>
        </div>
      </div>

      <div className="recent-alerts">
        <h3>Recent Alerts <ChevronDown /></h3>
        <div className="alerts-grid">
          {recentAlerts.map((alert, idx) => (
            <div key={idx} className={`alert-card alert-${alert.color}`}>
              <span>{alert.id}</span>
              <h4>{alert.patient}</h4>
              <p>Room {alert.room}</p>
              <div className={`alert-status alert-${alert.color}`}>{alert.statusText}</div>
            </div>
          ))}
        </div>
      </div>

      {results && (
        <div className="results-panel">
          <h3><Download /> Processing Results</h3>
          {results.processed_video && <a href={results.processed_video} target="_blank" rel="noreferrer"><Play /> Processed Video</a>}
          {results.ai_report && <a href={results.ai_report} target="_blank" rel="noreferrer"><Download /> AI Report</a>}
          {results.snapshot && <a href={results.snapshot} target="_blank" rel="noreferrer"><Eye /> Snapshot</a>}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
