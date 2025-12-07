import React, { useState } from 'react';

const RegistrationForm = () => {
    // 1. State to hold form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    // 2. State for feedback messages (success or error)
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // 3. Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // 4. Handle form submission and API call
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Registering...');
        setIsSuccess(false);

        // Basic validation
        if (!formData.username || !formData.email || !formData.password) {
            setMessage('All fields are required.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Success case (HTTP 201 Created)
                setMessage(`Success! User ${data.username} registered. Please log in.`);
                setIsSuccess(true);
                // Optionally clear the form
                setFormData({ username: '', email: '', password: '' });
            } else {
                // Error case (HTTP 400, 409, 500, etc.)
                setMessage(data.message || 'Registration failed due to an unknown error.');
                setIsSuccess(false);
            }
        } catch (error) {
            // Network error
            console.error('Network Error:', error);
            setMessage('Could not connect to the server. Check if the backend is running.');
            setIsSuccess(false);
        }
    };

    return (
        <div style={{ 
            // IMPROVED STYLING FOR VISIBILITY
            padding: '30px', 
            backgroundColor: 'white', // Ensure high contrast
            borderRadius: '10px', 
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            border: '2px solid #ccc'
        }}>
            <h2 style={{color: '#4CAF50', marginBottom: '20px'}}>Farmer Registration</h2>
            
            {/* Display Feedback Message */}
            {message && (
                <p style={{ color: isSuccess ? 'green' : 'red', fontWeight: 'bold' }}>
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <div>
                    <label htmlFor="username" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                </div>
                <div>
                    <label htmlFor="email" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                </div>
                <div>
                    <label htmlFor="password" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                </div>
                <button 
                    type="submit" 
                    style={{ padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
                >
                    Register Account
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;