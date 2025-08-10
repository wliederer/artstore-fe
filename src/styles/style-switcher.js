// Style Switcher Utility
// This allows easy switching between Windows 98 and Modern Retro styles

export const STYLE_THEMES = {
  WINDOWS_98: 'windows98',
  RETRO_MODERN: 'retro-modern'
};

// Map old win98 classes to new retro classes
export const CLASS_MAPPING = {
  'retro-button': 'retro-button',
  'retro-button-primary': 'retro-button-primary',
  'retro-button-large': 'retro-button-large',
  'retro-button-success': 'retro-button-success',
  'retro-button-warning': 'retro-button-warning',
  'retro-close-button': 'retro-close-button',
  'retro-quantity-btn': 'retro-quantity-btn',
  'retro-input': 'retro-input',
  'retro-select': 'retro-select',
  'retro-checkbox': 'retro-checkbox',
  'retro-form-group': 'retro-form-group',
  'retro-panel': 'retro-panel',
  'retro-quantity-input': 'retro-quantity-input'
};

// Function to get button classes based on current theme
export const getButtonClasses = (baseClasses, theme = STYLE_THEMES.RETRO_MODERN) => {
  if (theme === STYLE_THEMES.WINDOWS_98) {
    return baseClasses;
  }
  
  // Convert win98 classes to retro classes
  return baseClasses
    .split(' ')
    .map(className => CLASS_MAPPING[className] || className)
    .join(' ');
};

// React hook for theme management
export const useStyleTheme = (defaultTheme = STYLE_THEMES.RETRO_MODERN) => {
  const [currentTheme, setCurrentTheme] = React.useState(() => {
    // Check localStorage for saved preference
    return localStorage.getItem('app-style-theme') || defaultTheme;
  });

  const switchTheme = (newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('app-style-theme', newTheme);
    
    // Add theme class to document
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.documentElement.classList.add(`theme-${newTheme}`);
  };

  React.useEffect(() => {
    // Apply theme class on mount
    document.documentElement.classList.add(`theme-${currentTheme}`);
    
    return () => {
      document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, '')
        .trim();
    };
  }, [currentTheme]);

  const getClasses = (classes) => getButtonClasses(classes, currentTheme);

  return {
    currentTheme,
    switchTheme,
    getClasses,
    isWindows98: currentTheme === STYLE_THEMES.WINDOWS_98,
    isRetroModern: currentTheme === STYLE_THEMES.RETRO_MODERN
  };
};