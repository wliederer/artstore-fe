import React from 'react';

const InstagramIcon = ({ size = 24, className = '', href = '#', target = '_blank' }) => {
  const iconStyle = {
    width: size,
    height: size,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const linkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  };

  return (
    <a 
      href={href} 
      target={target} 
      rel="noopener noreferrer" 
      style={linkStyle}
      className={`instagram-link ${className}`}
      aria-label="Follow us on Instagram"
    >
      <svg
        style={iconStyle}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="instagram-icon"
      >
        {/* Instagram gradient definition */}
        <defs>
          <radialGradient id="instagram-gradient" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        
        {/* Instagram camera icon */}
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#instagram-gradient)" strokeWidth="2" fill="none"/>
        <path d="m7 13 3 3 3-3-3-3z" fill="none" stroke="url(#instagram-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="url(#instagram-gradient)"/>
        <circle cx="12" cy="12" r="3" fill="none" stroke="url(#instagram-gradient)" strokeWidth="2"/>
      </svg>
    </a>
  );
};

export default InstagramIcon;