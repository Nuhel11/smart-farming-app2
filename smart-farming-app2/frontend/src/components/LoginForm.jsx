import React, { useState } from 'react';

const LoginForm = ({ onLoginSuccess }) => {
    // State to hold form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // State for feedback messages
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission and API call
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Logging in...');
        setIsSuccess(false);

        if (!formData.email || !formData.password) {
            setMessage('Email and password are required.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // SUCCESS: Store the JWT and user data
                
                // 1. Store the JWT in Local Storage for persistent session
                localStorage.setItem('authToken', data.token);
                
                // 2. Store other necessary user info
                localStorage.setItem('user', JSON.stringify({
                    userId: data.userId,
                    username: data.username,
                    role: data.role
                }));
                
                setMessage(`Welcome back, ${data.username}!`);
                setIsSuccess(true);
                
                // Call the success handler passed from App.jsx to update the application state
                if (onLoginSuccess) {
                    onLoginSuccess(data.token, data.username, data.role);
                }

            } else {
                // Error case (401 Unauthorized, 400 Bad Request)
                setMessage(data.message || 'Login failed. Please check your credentials.');
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
            <h2>Farmer Login</h2>
            
            {/* Display Feedback Message */}
            {message && (
                <p style={{ color: isSuccess ? 'green' : 'red', fontWeight: 'bold' }}>
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
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
                    style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginForm;