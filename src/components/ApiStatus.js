import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import '../styles/windows98.css';

const ApiStatus = () => {
  const [status, setStatus] = useState('checking');
  const [config, setConfig] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    checkApiHealth();
    setConfig(apiService.getConfig());
  }, []);

  const checkApiHealth = async () => {
    try {
      setStatus('checking');
      setError('');
      await apiService.healthCheck();
      setStatus('connected');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#28a745';
      case 'error': return '#dc3545';
      case 'checking': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'error': return 'Disconnected';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'white',
      padding: '10px 15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
        <div 
          style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: getStatusColor() 
          }}
        />
        <strong>API Status: {getStatusText()}</strong>
        <button 
          onClick={checkApiHealth}
          className="retro-button"
          style={{
            padding: '2px 6px',
            fontSize: '10px',
            minWidth: '20px',
            height: '18px'
          }}
        >
          ↻
        </button>
      </div>
      <div style={{ color: '#666', fontSize: '10px' }}>
        <div>Environment: {config.environment}</div>
        <div>API: {config.baseURL}</div>
        {error && <div style={{ color: '#dc3545', marginTop: '5px' }}>Error: {error}</div>}
      </div>
    </div>
  );
};

export default ApiStatus;