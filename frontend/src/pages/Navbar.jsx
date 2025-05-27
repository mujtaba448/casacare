import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
import logo from './assets/logo.png';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/" className="logo-link">
                    <img src={logo} alt="CasaCare Logo" className="logo-image" />
                    <span className="logo-text">CasaCare</span>
                </Link>
            </div>
            <div className="navbar-links">
                <Link to="/">Home</Link>

                {user && (
                    <>
                        <Link to="/booking-history">Booking History</Link>
                        <Link to="/reviews">Reviews</Link>
                    </>
                )}

                {user ? (
                    <>
                        <span className="navbar-username">Hello, {user.username}</span>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;