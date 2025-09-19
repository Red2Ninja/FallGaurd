import React, { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [emails, setEmails] = useState("");
  const [duration, setDuration] = useState(10);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const webcamRef = useRef(null);
  const API_BASE = "http://127.0.0.1:8000";

  // Handle file input
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload video for processing
  const handleUpload = async () => {
    if (!file || !emails) {
      alert("Please select a video and enter emails.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("emails", emails);

    try {
      const res = await axios.post(`${API_BASE}/upload-video/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
    setLoading(false);
  };

  // Record webcam (trigger backend, not local)
  const handleWebcam = async () => {
    if (!emails) {
      alert("Please enter emails.");
      return;
    }

    setLoading(true);
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
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>FallGuard System</h1>

      {/* Emails */}
      <div className="form-section">
        <label>Emails (comma separated):</label>
        <input
          type="text"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="example1@mail.com, example2@mail.com"
        />
      </div>

      {/* Upload Video */}
      <div className="form-section">
        <label>Upload a Video:</label>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Upload & Process"}
        </button>
      </div>

      {/* Live Webcam */}
      <div className="form-section">
        <label>Live Webcam Preview:</label>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          style={{ width: "100%", borderRadius: "10px" }}
        />
        <div className="webcam-controls">
          <label>Duration (seconds):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="5"
            max="60"
          />
          <button onClick={handleWebcam} disabled={loading}>
            {loading ? "Recording..." : "Record Webcam"}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="results">
          <h2>Results</h2>
          {results.message ? (
            <p>{results.message}</p>
          ) : (
            <>
              <a href={results.processed_video} target="_blank" rel="noreferrer">
                📹 Download Processed Video
              </a>
              <a href={results.ai_report} target="_blank" rel="noreferrer">
                📄 Download AI Report
              </a>
              <a href={results.snapshot} target="_blank" rel="noreferrer">
                🖼️ Download Snapshot
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
