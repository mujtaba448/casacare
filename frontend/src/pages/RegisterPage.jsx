import React, { useState } from 'react';
import './registerPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const { username, email, phone, password, confirmPassword } = formData;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            setError('Username, email, and password are required.');
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('http://localhost/siraj/homeservice/service-backend/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, phone, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                setSuccess(data.message || 'Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login'; // Redirect to login page after 2 seconds
                }, 2000);
            } else {
                setError(data.error || 'An error occurred during registration.');
            }
        } catch (err) {
            setLoading(false);
            console.error('Error:', err.message);
            setError('Failed to connect to the server. Please try again later.');
        }
    };

    return (
        <div className="register-container">
            <div className="register-left-content">
                <div className="brand-section">
                    <h1 className="brand-title">CasaCare</h1>
                    <p className="brand-subtitle">Your Trusted Home Service Partner</p>
                </div>
                
                <div className="features-section">
                    <h3>Join CasaCare Today!</h3>
                    <div className="feature-item">
                        <div className="feature-icon">🚀</div>
                        <div className="feature-text">
                            <h4>Easy Registration</h4>
                            <p>Quick and simple signup process to get started</p>
                        </div>
                    </div>
                    
                    <div className="feature-item">
                        <div className="feature-icon">🔒</div>
                        <div className="feature-text">
                            <h4>Secure & Safe</h4>
                            <p>Your personal information is protected with us</p>
                        </div>
                    </div>
                    
                    <div className="feature-item">
                        <div className="feature-icon">🎯</div>
                        <div className="feature-text">
                            <h4>Personalized Service</h4>
                            <p>Tailored home services based on your needs</p>
                        </div>
                    </div>
                </div>
                
                <div className="contact-info">
                    <p className="contact-text">Need help? Contact our support team</p>
                    <p className="contact-number">📞 +91 9309526136</p>
                </div>
            </div>
            
            <div className="register-right-content">
                <form onSubmit={handleRegister} className="register-form">
                    <h2>Create Your Account</h2>
                    <p className="register-subtitle">Join CasaCare and access premium home services</p>
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
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Create Account'}
                    </button>
                    <p>
                        Already have an account? <a href="/login">Login here</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;