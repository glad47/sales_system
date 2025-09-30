import React from 'react';
import './Footer.scss'
const Footer = () => (
  <div style={{ textAlign: 'center' }}>
    <button className="print-btn" onClick={() => window.print()}>طباعة</button>
  </div>
);

export default Footer;
