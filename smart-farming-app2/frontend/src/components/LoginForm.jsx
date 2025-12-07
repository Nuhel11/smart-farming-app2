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
<<<<<<< HEAD
                localStorage.setItem('authToken', data.token);
=======
                
                // 1. Store the JWT in Local Storage for persistent session
                localStorage.setItem('authToken', data.token);
                
                // 2. Store other necessary user info
>>>>>>> Manishv2
                localStorage.setItem('user', JSON.stringify({
                    userId: data.userId,
                    username: data.username,
                    role: data.role
                }));
                
                setMessage(`Welcome back, ${data.username}!`);
                setIsSuccess(true);
                
<<<<<<< HEAD
=======
                // Call the success handler passed from App.jsx to update the application state
>>>>>>> Manishv2
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
<<<<<<< HEAD
        <div style={{ 
            // IMPROVED STYLING FOR VISIBILITY
            padding: '30px', 
            backgroundColor: 'white', // Ensure high contrast
            borderRadius: '10px', 
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            border: '2px solid #ccc'
        }}>
            <h2 style={{color: '#3498db', marginBottom: '20px'}}>Farmer Login</h2>
=======
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Farmer Login</h2>
>>>>>>> Manishv2
            
            {/* Display Feedback Message */}
            {message && (
                <p style={{ color: isSuccess ? 'green' : 'red', fontWeight: 'bold' }}>
                    {message}
                </p>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <div>
<<<<<<< HEAD
                    <label htmlFor="email" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Email:</label>
=======
                    <label htmlFor="email">Email:</label>
>>>>>>> Manishv2
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
<<<<<<< HEAD
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                    />
                </div>
                <div>
                    <label htmlFor="password" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Password:</label>
=======
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
>>>>>>> Manishv2
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
<<<<<<< HEAD
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
=======
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
>>>>>>> Manishv2
                    />
                </div>
                <button 
                    type="submit" 
<<<<<<< HEAD
                    style={{ padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
                >
                    Login to Dashboard
=======
                    style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Login
>>>>>>> Manishv2
                </button>
            </form>
        </div>
    );
};

export default LoginForm;