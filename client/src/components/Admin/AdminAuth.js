import React, { useState, useEffect } from "react";
import AdminPanel from "./AdminPanel";
import { getServerUrl } from "../../utils/serverConfig";

const SERVER_URL = getServerUrl();

const AdminAuth = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Check if user is already authenticated via localStorage
		const isAuth = localStorage.getItem('adminAuth');
		if (isAuth === 'true') {
			setIsAuthenticated(true);
		}
	}, []);

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await fetch(`${SERVER_URL}/api/admin/auth`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ password })
			});

			const result = await response.json();

			if (result.success) {
				localStorage.setItem('adminAuth', 'true');
				setIsAuthenticated(true);
			} else {
				setError(result.message || 'Invalid password');
			}
		} catch (error) {
			setError('Connection error. Please try again.');
		}

		setLoading(false);
	};

	if (isAuthenticated) {
		return <AdminPanel />;
	}

	return (
		<div style={{
			minHeight: '100vh',
			background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
			color: '#ffffff'
		}}>
			<div style={{
				background: 'rgba(255, 255, 255, 0.1)',
				backdropFilter: 'blur(10px)',
				borderRadius: '20px',
				padding: '40px',
				width: '400px',
				textAlign: 'center',
				boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
				border: '1px solid rgba(255, 255, 255, 0.2)'
			}}>
				<h1 style={{
					fontSize: '2.5rem',
					marginBottom: '10px',
					background: 'linear-gradient(45deg, #00d4ff, #ffffff)',
					WebkitBackgroundClip: 'text',
					WebkitTextFillColor: 'transparent',
					fontWeight: 'bold'
				}}>
					Alliance Demo
				</h1>
				<p style={{
					fontSize: '1.1rem',
					marginBottom: '30px',
					opacity: 0.8
				}}>
					Admin Access Required
				</p>

				<form onSubmit={handleLogin}>
					<div style={{ marginBottom: '20px', textAlign: 'left' }}>
						<label style={{
							display: 'block',
							marginBottom: '8px',
							fontWeight: 500,
							opacity: 0.9
						}}>
							Enter Admin Password:
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
							required
							style={{
								width: '100%',
								padding: '15px',
								border: '2px solid rgba(255, 255, 255, 0.2)',
								borderRadius: '10px',
								background: 'rgba(255, 255, 255, 0.1)',
								color: '#ffffff',
								fontSize: '1.1rem',
								boxSizing: 'border-box'
							}}
							autoFocus
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						style={{
							width: '100%',
							padding: '15px',
							background: loading ? '#666' : 'linear-gradient(45deg, #00d4ff, #0099cc)',
							border: 'none',
							borderRadius: '10px',
							color: 'white',
							fontSize: '1.1rem',
							fontWeight: 'bold',
							cursor: loading ? 'not-allowed' : 'pointer',
							marginTop: '10px'
						}}
					>
						{loading ? 'Authenticating...' : 'Access Admin Panel'}
					</button>
				</form>

				{error && (
					<div style={{
						background: 'rgba(220, 53, 69, 0.2)',
						border: '1px solid rgba(220, 53, 69, 0.4)',
						borderRadius: '8px',
						padding: '12px',
						marginTop: '15px',
						color: '#ff6b6b',
						fontSize: '0.95rem'
					}}>
						{error}
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminAuth;