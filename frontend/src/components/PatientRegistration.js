import React, { useState } from 'react';
import './PatientRegistration.css';
const PatientRegistration = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    guardianEmail: '',
    medicalHistory: '',
    age: '',
    room: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.guardianEmail || !formData.age) {
      alert('Please fill in all required fields.');
      return;
    }
    console.log('New Patient:', formData);
    if (onSubmit) onSubmit(formData);
    // Reset form
    setFormData({ name: '', guardianEmail: '', medicalHistory: '', age: '', room: '' });
  };

  return (
    <div className="registration-container">
      <h2>Add New Patient</h2>
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Patient Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter patient name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="guardianEmail">Guardian Email*</label>
          <input
            type="email"
            id="guardianEmail"
            name="guardianEmail"
            value={formData.guardianEmail}
            onChange={handleChange}
            placeholder="Enter guardian email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age*</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter patient age"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="room">Room Number</label>
          <input
            type="text"
            id="room"
            name="room"
            value={formData.room}
            onChange={handleChange}
            placeholder="Enter room number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="medicalHistory">Medical History</label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            placeholder="Enter medical history"
            rows="4"
          ></textarea>
        </div>

        <button type="submit" className="submit-btn">
          Add Patient
        </button>
      </form>
    </div>
  );
};

export default PatientRegistration;
