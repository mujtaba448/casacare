import React, { useState } from 'react';
import './loginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { username, password } = formData;

        if (!username || !password) {
            alert('Username and password are required.');
            return;
        }

        setLoading(true);

        try {
            // Send login request to backend
            const response = await fetch('http://localhost/siraj/homeservice/service-backend/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                // Login successful
                alert(data.message);
                localStorage.setItem('user', JSON.stringify(data.user)); // Store user data in localStorage
                window.location.href = '/'; // Redirect to home page
            } else {
                setError(data.error || 'Login failed.');
            }
        } catch (err) {
            setLoading(false);
            console.error('Error:', err.message);
            setError('Failed to connect to the server. Please try again later.');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p>
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
