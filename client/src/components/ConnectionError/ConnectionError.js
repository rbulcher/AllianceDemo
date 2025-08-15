import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getServerUrl } from '../../utils/serverConfig';
import './ConnectionError.css';

const ConnectionError = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isConnecting, setIsConnecting] = useState(false);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.search);
    const deviceType = urlParams.get('device') || 'device';
    const reason = urlParams.get('reason') || 'Connection limit reached';
    
    const handleForceConnectClick = () => {
        setShowPasswordPrompt(true);
        setPassword('');
        setPasswordError('');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        
        // Check password
        if (password !== '7913') {
            setPasswordError('Incorrect password');
            return;
        }
        
        // Password correct, proceed with force connect
        setShowPasswordPrompt(false);
        performForceConnect();
    };

    const performForceConnect = () => {
        setIsConnecting(true);
        
        // Connect to server and request force connection
        const socket = io(getServerUrl());
        
        socket.on('connect', () => {
            console.log('Connected, requesting force connect for:', deviceType);
            socket.emit('force-connect', deviceType);
        });
        
        socket.on('force-connect-success', () => {
            console.log('Force connect successful, redirecting...');
            socket.disconnect();
            navigate(`/${deviceType}`);
        });
        
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsConnecting(false);
            alert('Connection failed. Please try again.');
            socket.disconnect();
        });
        
        // Timeout fallback
        setTimeout(() => {
            if (isConnecting) {
                setIsConnecting(false);
                alert('Connection timeout. Please try again.');
                socket.disconnect();
            }
        }, 10000);
    };

    const handleCancelPassword = () => {
        setShowPasswordPrompt(false);
        setPassword('');
        setPasswordError('');
    };
    
    const getDeviceIcon = () => {
        switch(deviceType) {
            case 'controller': return '📱';
            case 'display': return '🖥️';
            default: return '📟';
        }
    };
    
    return (
        <div className="connection-error-page">
            <div className="error-container">
                <div className="device-icon">
                    {getDeviceIcon()}
                </div>
                <h1 className="error-title">Connection Blocked</h1>
                <p className="error-subtitle">Maximum {deviceType}s currently open</p>
                
                <div className="error-message">
                    <strong>Reason:</strong> {reason}
                </div>
                
                <div className="instructions">
                    <h3>What to do:</h3>
                    <ul>
                        <li><strong>Force Connect</strong> - Take over the existing connection (recommended for tradeshow)</li>
                        <li><strong>Close other {deviceType} windows/tabs</strong> - Only one {deviceType} can be connected at a time</li>
                        <li><strong>Wait and retry</strong> - The connection may become available shortly</li>
                    </ul>
                </div>
                
                <button 
                    className={`force-connect-btn ${isConnecting ? 'connecting' : ''}`}
                    onClick={handleForceConnectClick}
                    disabled={isConnecting}
                >
                    {isConnecting ? 'Connecting...' : 'Force Connect '}
                </button>
                
                {/* Password Prompt Modal */}
                {showPasswordPrompt && (
                    <div className="password-modal-overlay">
                        <div className="password-modal">
                            <h3>Admin Access Required</h3>
                            <p>Enter the admin password to force connect:</p>
                            <form onSubmit={handlePasswordSubmit}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    autoFocus
                                    className={passwordError ? 'error' : ''}
                                />
                                {passwordError && (
                                    <div className="password-error">{passwordError}</div>
                                )}
                                <div className="password-buttons">
                                    <button type="button" onClick={handleCancelPassword} className="cancel-btn">
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        Connect
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectionError;