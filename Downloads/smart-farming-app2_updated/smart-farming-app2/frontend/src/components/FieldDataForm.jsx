import React, { useState } from 'react';

// Define common styles for reusability
const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '5px 0 15px 0',
    border: '1px solid #ccc',
    borderRadius: '6px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s, box-shadow 0.3s'
};

const labelStyle = {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333'
};

const FieldDataForm = ({ onDataSubmit }) => {
    const [formData, setFormData] = useState({
        field_name: '', latitude: '', longitude: '', area_sq_m: '',
        nitrogen_ppm: '', phosphorus_ppm: '', potassium_ppm: '', ph_level: ''
    });
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Submitting data...');
        setIsSuccess(false);

        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
            setMessage('Error: You must be logged in to submit data.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/farm/field', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Success! ${data.message} Field ID: ${data.fieldId}`);
                setIsSuccess(true);
                // Optionally clear the form:
                // setFormData({ field_name: '', latitude: '', longitude: '', area_sq_m: '', nitrogen_ppm: '', phosphorus_ppm: '', potassium_ppm: '', ph_level: '' });
                if (onDataSubmit) onDataSubmit(); 

            } else if (response.status === 401) {
                setMessage('Session expired. Please log in again.');
            } else {
                setMessage(data.message || 'Data submission failed.');
            }
        } catch (error) {
            console.error('Network Error:', error);
            setMessage('Could not connect to the backend server.');
        }
    };

    return (
        <div style={{ 
            padding: '30px', 
            border: '1px solid #e0e0e0', 
            borderRadius: '12px', 
            margin: '20px 0', 
            backgroundColor: '#fff',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.05)'
        }}>
            <h3 style={{ borderBottom: '2px solid #4CAF50', paddingBottom: '10px', marginBottom: '20px', color: '#1a1a1a' }}>
                <span role="img" aria-label="soil">🧪</span> Record New Field & Soil Data
            </h3>
            
            {message && (
                <p style={{ color: isSuccess ? '#27ae60' : '#c0392b', fontWeight: 'bold', backgroundColor: isSuccess ? '#e9f7ef' : '#fbe7e6', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '30px' // Increased gap for visual space
            }}>
                {/* --- Field Location Data --- */}
                <fieldset style={{ 
                    border: '1px solid #4CAF50', 
                    padding: '20px', 
                    borderRadius: '8px',
                    backgroundColor: '#f9fff9' // Light green background for section
                }}>
                    <legend style={{ 
                        fontWeight: 'bold', 
                        padding: '0 10px', 
                        color: '#4CAF50', 
                        fontSize: '1.1em' 
                    }}>
                        Field Details
                    </legend>
                    
                    <label style={labelStyle}>Field Name:</label>
                    <input type="text" name="field_name" value={formData.field_name} onChange={handleChange} required style={inputStyle} />
                    
                    <label style={labelStyle}>Latitude:</label>
                    <input type="number" step="0.000001" name="latitude" value={formData.latitude} onChange={handleChange} required style={inputStyle} />
                    
                    <label style={labelStyle}>Longitude:</label>
                    <input type="number" step="0.000001" name="longitude" value={formData.longitude} onChange={handleChange} required style={inputStyle} />
                    
                    <label style={labelStyle}>Area (sq. m):</label>
                    <input type="number" name="area_sq_m" value={formData.area_sq_m} onChange={handleChange} style={inputStyle} />
                </fieldset>

                {/* --- Soil Data --- */}
                <fieldset style={{ 
                    border: '1px solid #3498db', 
                    padding: '20px', 
                    borderRadius: '8px',
                    backgroundColor: '#f9f9ff' // Light blue background for section
                }}>
                    <legend style={{ 
                        fontWeight: 'bold', 
                        padding: '0 10px', 
                        color: '#3498db', 
                        fontSize: '1.1em' 
                    }}>
                        Soil Test Results (ppm / pH)
                    </legend>
                    
                    <label style={labelStyle}>Nitrogen (N):</label>
                    <input type="number" name="nitrogen_ppm" value={formData.nitrogen_ppm} onChange={handleChange} required style={inputStyle} />
                    
                    <label style={labelStyle}>Phosphorus (P):</label>
                    <input type="number" name="phosphorus_ppm" value={formData.phosphorus_ppm} onChange={handleChange} required style={inputStyle} />
                    
                    <label style={labelStyle}>Potassium (K):</label>
                    <input type="number" name="potassium_ppm" value={formData.potassium_ppm} onChange={handleChange} required style={inputStyle} />
                    
                    <label style={labelStyle}>pH Level:</label>
                    <input type="number" step="0.1" name="ph_level" value={formData.ph_level} onChange={handleChange} required style={inputStyle} />
                </fieldset>
                
                {/* --- Submit Button --- */}
                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <button 
                        type="submit" 
                        style={{ 
                            padding: '15px 20px', 
                            backgroundColor: '#4CAF50', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            width: '100%',
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                    >
                        Submit Field Data & Get Recommendations
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FieldDataForm;