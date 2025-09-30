import React from 'react';
import './HeaderForm.scss';

const HeaderForm = ({header}) => (
  <div className="header-container">
    <div className="decor">
      {[...Array(15)].map((_, i) => (
        <span key={i} className={`d${i + 1}`}></span>
      ))}
    </div>
    <div className="header-bar">
      <h2><span className="aref-ruqaa-bold">كيو</span></h2>
      <span className="quote-title aref-ruqaa-bold">{header ? header : ''}</span>
      <span id="q-logo">Q</span>
    </div>
  </div>
);

export default HeaderForm;
