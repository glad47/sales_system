import React from 'react';
import logoSrc from '../assets/logo.png'; // or .png
import './Logo.scss';

const Logo = () => (
  <div className="logo-wrapper">
    <div className="app-logo">
      <img src={logoSrc} alt="National Day Logo" />
    </div>
    <div className="badge"># تقدر _ تجيبها</div>
  </div>
);


export default Logo;