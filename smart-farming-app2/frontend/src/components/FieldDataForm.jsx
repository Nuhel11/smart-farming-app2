import React, { useState } from 'react';

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

        // Retrieve JWT from local storage
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
                    'Authorization': `Bearer ${authToken}` // Attach JWT for protection
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Success! ${data.message} Field ID: ${data.fieldId}`);
                setIsSuccess(true);
                // Reset form data and call the parent handler
                setFormData({ field_name: '', latitude: '', longitude: '', area_sq_m: '', nitrogen_ppm: '', phosphorus_ppm: '', potassium_ppm: '', ph_level: '' });
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
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px 0' }}>
            <h3>Record New Field & Soil Data</h3>
            
            {message && (
                <p style={{ color: isSuccess ? 'green' : 'red', fontWeight: 'bold' }}>{message}</p>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                {/* --- Field Location Data --- */}
                <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
                    <legend style={{ padding: '0 10px', fontWeight: 'bold' }}>Field Details</legend>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Name:</label>
                        <input 
                            type="text" 
                            name="field_name" 
                            value={formData.field_name} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Latitude:</label>
                        <input 
                            type="number" 
                            step="0.000001" 
                            name="latitude" 
                            value={formData.latitude} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Longitude:</label>
                        <input 
                            type="number" 
                            step="0.000001" 
                            name="longitude" 
                            value={formData.longitude} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '0' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Area (sq. m):</label>
                        <input 
                            type="number" 
                            name="area_sq_m" 
                            value={formData.area_sq_m} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                        />
                    </div>
                </fieldset>

                {/* --- Soil Data --- */}
                <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px' }}>
                    <legend style={{ padding: '0 10px', fontWeight: 'bold' }}>Soil Test Results (ppm / pH)</legend>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nitrogen (N):</label>
                        <input 
                            type="number" 
                            name="nitrogen_ppm" 
                            value={formData.nitrogen_ppm} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Phosphorus (P):</label>
                        <input 
                            type="number" 
                            name="phosphorus_ppm" 
                            value={formData.phosphorus_ppm} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Potassium (K):</label>
                        <input 
                            type="number" 
                            name="potassium_ppm" 
                            value={formData.potassium_ppm} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '0' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>pH Level:</label>
                        <input 
                            type="number" 
                            step="0.1" 
                            name="ph_level" 
                            value={formData.ph_level} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                        />
                    </div>
                </fieldset>
                
                <button 
                    type="submit" 
                    style={{ 
                        padding: '12px 20px', 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontSize: '16px',
                        fontWeight: 'bold',
                        gridColumn: '1 / -1',
                        marginTop: '10px',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                >
                    Submit Field Data
                </button>
            </form>
        </div>
    );
};

export default FieldDataForm;