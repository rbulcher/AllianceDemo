import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getServerUrl } from '../../utils/serverConfig';
import './ConnectionError.css';

const ConnectionError = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isConnecting, setIsConnecting] = useState(false);
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.search);
    const deviceType = urlParams.get('device') || 'device';
    const reason = urlParams.get('reason') || 'Connection limit reached';
    
    const handleForceConnect = () => {
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
                    onClick={handleForceConnect}
                    disabled={isConnecting}
                >
                    {isConnecting ? 'Connecting...' : 'Force Connect '}
                </button>
            </div>
        </div>
    );
};

export default ConnectionError;