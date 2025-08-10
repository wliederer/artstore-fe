import React, { useState, useEffect } from 'react';
import './ColorThemeSwitcher.css';

const ColorThemeSwitcher = ({ className = '' }) => {
  const [currentTheme, setCurrentTheme] = useState('wada-theme-dusty-sage');
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      id: 'wada-theme-dusty-sage',
      name: 'Dusty Rose & Sage',
      description: 'Soft rose with gentle green',
      colors: ['#c49a9a', '#8ba68b', '#f7f3e9']
    },
    {
      id: 'wada-theme-terracotta-teal',
      name: 'Terracotta & Teal',
      description: 'Warm earth with deep water',
      colors: ['#c4785a', '#4a6b6b', '#f5f1e8']
    },
    {
      id: 'wada-theme-mustard-navy',
      name: 'Mustard & Navy',
      description: 'Golden yellow with deep blue',
      colors: ['#d4a574', '#405d72', '#ede7d3']
    },
    {
      id: 'wada-theme-coral-forest',
      name: 'Coral & Forest',
      description: 'Living coral with forest green',
      colors: ['#c47b7b', '#5a7c5a', '#faf5e4']
    },
    {
      id: 'wada-theme-mauve-olive',
      name: 'Mauve & Olive',
      description: 'Purple gray with olive green',
      colors: ['#a67c9a', '#7a8471', '#f8f5f0']
    }
  ];

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('wada-color-theme');
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme(currentTheme);
    }
  }, []);

  const applyTheme = (themeId) => {
    // Remove all theme classes
    themes.forEach(theme => {
      document.documentElement.classList.remove(theme.id);
    });
    
    // Add new theme class
    document.documentElement.classList.add(themeId);
    
    // Save to localStorage
    localStorage.setItem('wada-color-theme', themeId);
  };

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <div className={`color-theme-switcher ${className}`}>
      <button 
        className="theme-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change color theme"
      >
        <div className="current-theme-indicator">
          {currentThemeData.colors.map((color, index) => (
            <div 
              key={index}
              className="color-dot"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="theme-name">{currentThemeData.name}</span>
        <svg 
          className={`arrow ${isOpen ? 'open' : ''}`}
          width="12" 
          height="8" 
          viewBox="0 0 12 8"
        >
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="theme-dropdown-overlay" onClick={() => setIsOpen(false)} />
          <div className="theme-dropdown">
            <div className="theme-dropdown-header">
              <h3>Wada Sanzo Palettes</h3>
              <p>Choose your color combination</p>
            </div>
            <div className="theme-options">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  className={`theme-option ${theme.id === currentTheme ? 'active' : ''}`}
                  onClick={() => handleThemeChange(theme.id)}
                >
                  <div className="theme-colors">
                    {theme.colors.map((color, index) => (
                      <div 
                        key={index}
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="theme-info">
                    <div className="theme-option-name">{theme.name}</div>
                    <div className="theme-description">{theme.description}</div>
                  </div>
                  {theme.id === currentTheme && (
                    <div className="active-indicator">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColorThemeSwitcher;