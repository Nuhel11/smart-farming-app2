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
                setMessage(`Success! User ${data.username} registered.`);
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
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Farmer Registration</h2>
            
            {/* Display Feedback Message */}
            {message && (
                <p style={{ color: isSuccess ? 'green' : 'red', fontWeight: 'bold' }}>
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <button 
                    type="submit" 
                    style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;

