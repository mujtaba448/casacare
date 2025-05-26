import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-address">
          <h3>Contact Us</h3>
          <p>Pune 48, Kondhwa khurd</p>
          <p>Email: support@servicemanagement.com</p>
          <p>Phone: +91 9309526136</p>
        </div>
        <div className="footer-social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src={require("./assets/facebook.png")} alt="Facebook" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src={require("./assets/Twitter.png")} alt="Twitter" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src={require("./assets/instagram.png")} alt="Instagram" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <img src={require("./assets/linkedin.png")} alt="LinkedIn" />
            </a>
          </div>
        </div>
        <div className="footer-others">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/services">Our Services</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 CasaCare. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
