import React, { useState } from 'react';
import './PatientRegistration.css';
import axios from 'axios';

const PatientRegistration = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    medicalHistory: '',
    images: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.guardianEmail || !formData.age) return alert('Fill required fields');

    const dataToSend = new FormData();
    dataToSend.append("patient_id", Date.now().toString());
    dataToSend.append("name", formData.name);
    dataToSend.append("age", formData.age);
    dataToSend.append("guardian_name", formData.guardianName);
    dataToSend.append("guardian_email", formData.guardianEmail);
    dataToSend.append("guardian_phone", formData.guardianPhone || '');
    dataToSend.append("medical_history", formData.medicalHistory || '');
    formData.images.forEach(img => dataToSend.append("images", img));

    try {
      const res = await axios.post("http://127.0.0.1:8000/register-face/", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(res.data.message);

      // Reset form
      setFormData({
        name: '',
        age: '',
        guardianName: '',
        guardianEmail: '',
        guardianPhone: '',
        medicalHistory: '',
        images: []
      });

    } catch (err) {
      console.error(err);
      alert("Registration failed!");
    }
  };

  return (
    <div className="registration-container">
      <h2>Add New Patient</h2>
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Patient Name*</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Guardian Name</label>
          <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Guardian Email*</label>
          <input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Guardian Phone</label>
          <input type="text" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Age*</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label>Medical History</label>
          <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange}></textarea>
        </div>
        <div className="form-group">
          <label>Face Images</label>
          <input type="file" multiple onChange={handleFileChange} />
        </div>
        <button type="submit">Add Patient</button>
      </form>
    </div>
  );
};

export default PatientRegistration;
