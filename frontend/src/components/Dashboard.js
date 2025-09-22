import React, { useState, useRef } from 'react';
import { Upload, Camera, Play, Download, Eye, ChevronDown } from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

const API_BASE = "http://127.0.0.1:8000";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const recentAlerts = [
    { id: '#111836', patient: 'Aditi', room: '1004A', statusText: 'UnStable', color: 'cyan' },
    { id: '#0B101B', patient: 'Sanjana', room: '1004A', statusText: 'Sleeping', color: 'yellow' },
    { id: '#171876', patient: 'Aarya', room: '1004C', statusText: 'Unconcious', color: 'red' },
  ];

  // Handle file upload
  const handleFileUpload = (e) => setFile(e.target.files[0]);

  // Process selected/uploaded video
  const processVideo = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/upload-video/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Video upload failed!");
    }
    setLoading(false);
  };

  // Process a file from disk
  const handleProcessUpload = async () => {
    if (!file) return alert('Please select a video file first.');
    const formData = new FormData();
    formData.append("video", file);
    await processVideo(formData);
  };

  // Record from webcam
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
        const recordedFile = new File([blob], 'recorded_video.mp4', { type: 'video/mp4' });

        const formData = new FormData();
        formData.append("video", recordedFile);

        await processVideo(formData);

        // Stop camera stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      // Auto stop after duration
      setTimeout(() => {
        mediaRecorder.stop();
      }, duration * 1000);

    } catch (err) {
      console.error("Webcam error:", err);
      alert("Could not access webcam");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Live Camera Feed (only visible during recording) */}
      <div className="video-panel">
        <div className="video-wrapper">
          <video ref={videoRef} autoPlay muted className="video-element" />
        </div>
      </div>

      {/* Controls */}
      <div className="control-panels">
        {/* Upload Panel */}
        <div className="video-upload-panel">
          <h3><Upload /> Video Analysis</h3>
          <input type="file" accept="video/*" onChange={handleFileUpload} />
          {file && <p>Selected: {file.name}</p>}
          <button onClick={handleProcessUpload} disabled={loading}>
            {loading ? 'Processing...' : 'Process Uploaded Video'}
          </button>
        </div>

        {/* Webcam Panel */}
        <div className="live-record-panel">
          <h3><Camera /> Live Recording</h3>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="5"
            max="300"
          />
          <button onClick={startRecording} disabled={loading}>
            {loading ? 'Processing...' : <><Play /> Start Recording</>}
          </button>
        </div>
      </div>

      {/* Recent Alerts */}
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

      {/* Results */}
      {results && (
        <div className="results-panel">
          <h3><Download /> Processing Results</h3>
          {results.processed_video &&
            <a href={results.processed_video} target="_blank" rel="noreferrer">
              <Play /> Processed Video
            </a>}
          {results.ai_report &&
            <a href={results.ai_report} target="_blank" rel="noreferrer">
              <Download /> AI Report
            </a>}
          {results.snapshot &&
            <a href={results.snapshot} target="_blank" rel="noreferrer">
              <Eye /> Snapshot
            </a>}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
