import React, { useState } from 'react';
import './loginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { username, password } = formData;

        if (!username || !password) {
            setError('Username and password are required.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

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
                setSuccess(data.message || 'Login successful! Redirecting...');
                localStorage.setItem('user', JSON.stringify(data.user)); // Store user data in localStorage
                setTimeout(() => {
                    window.location.href = '/'; // Redirect to home page after 2 seconds
                }, 2000);
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
            <div className="login-left-content">
                <div className="brand-section">
                    <h1 className="brand-title">CasaCare</h1>
                    <p className="brand-subtitle">Your Trusted Home Service Partner</p>
                </div>
                
                <div className="features-section">
                    <h3>Why Choose CasaCare?</h3>
                    <div className="feature-item">
                        <div className="feature-icon">🏠</div>
                        <div className="feature-text">
                            <h4>Professional Home Services</h4>
                            <p>Expert technicians for all your home maintenance needs</p>
                        </div>
                    </div>
                    
                    <div className="feature-item">
                        <div className="feature-icon">⚡</div>
                        <div className="feature-text">
                            <h4>Quick & Reliable</h4>
                            <p>Fast response times and dependable service delivery</p>
                        </div>
                    </div>
                    
                    <div className="feature-item">
                        <div className="feature-icon">💯</div>
                        <div className="feature-text">
                            <h4>Quality Guaranteed</h4>
                            <p>100% satisfaction guarantee on all our services</p>
                        </div>
                    </div>
                </div>
                
                <div className="contact-info">
                    <p className="contact-text">Need help? Contact our support team</p>
                    <p className="contact-number">📞 +91 9309526136</p>
                </div>
            </div>
            
            <div className="login-right-content">
                                    <form onSubmit={handleLogin} className="login-form">
                    <h2>Welcome Back</h2>
                    <p className="login-subtitle">Sign in to your CasaCare account</p>
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
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
        </div>
    );
};

export default LoginPage;