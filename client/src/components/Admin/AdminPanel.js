import React from "react";
import { useSocket } from "../../hooks/useSocket";
import { getAllScenarios } from "../../data/scenarios";
import { ROUTES, APP_CONFIG } from "../../utils/constants";
import "./AdminPanel.css";

const AdminPanel = () => {
	const { demoState, adminReset, adminGotoStep, startScenario, isConnected } =
		useSocket("admin");

	const scenarios = getAllScenarios();

	const handleReset = () => {
		if (window.confirm("Are you sure you want to reset the demo?")) {
			adminReset();
		}
	};

	const handleGotoStep = (step) => {
		const stepNumber = parseInt(step);
		if (!isNaN(stepNumber)) {
			adminGotoStep(stepNumber);
		}
	};

	const handleStartScenario = (scenarioId) => {
		startScenario(scenarioId);
	};

	return (
		<div className="admin-panel">
			<div className="admin-header">
				<h1>Alliance Demo - Admin Panel</h1>
				<div className="connection-status">
					{isConnected ? (
						<span className="connected">🟢 Connected</span>
					) : (
						<span className="disconnected">🔴 Disconnected</span>
					)}
				</div>
			</div>

			<div className="admin-content">
				<div className="admin-section">
					<h2>Current Demo State</h2>
					<div className="state-info">
						<div className="state-item">
							<label>Scenario:</label>
							<span>{demoState.currentScenario || "None selected"}</span>
						</div>
						<div className="state-item">
							<label>Current Step:</label>
							<span>{demoState.currentStep + 1}</span>
						</div>
						<div className="state-item">
							<label>Video Playing:</label>
							<span>{demoState.isVideoPlaying ? "Yes" : "No"}</span>
						</div>
					</div>
				</div>

				<div className="admin-section">
					<h2>Quick Actions</h2>
					<div className="action-buttons">
						<button className="reset-button" onClick={handleReset}>
							Reset Demo
						</button>
						<button
							className="nav-button"
							onClick={() => (window.location.href = ROUTES.SCENARIO_SELECT)}
						>
							Scenario Select
						</button>
						<button
							className="nav-button"
							onClick={() => (window.location.href = ROUTES.DISPLAY)}
						>
							Display View
						</button>
						<button
							className="nav-button"
							onClick={() => (window.location.href = ROUTES.CONTROLLER)}
						>
							Controller View
						</button>
					</div>
				</div>

				<div className="admin-section">
					<h2>Scenario Control</h2>
					<div className="scenario-controls">
						{scenarios.map((scenario) => (
							<div key={scenario.id} className="scenario-control">
								<div className="scenario-info">
									<h4>{scenario.title}</h4>
									<p>{scenario.totalSteps} steps</p>
								</div>
								<button
									className="start-scenario-button"
									onClick={() => handleStartScenario(scenario.id)}
								>
									Start
								</button>
							</div>
						))}
					</div>
				</div>

				<div className="admin-section">
					<h2>Step Navigation</h2>
					<div className="step-controls">
						<label htmlFor="step-input">Go to Step:</label>
						<input
							id="step-input"
							type="number"
							min="1"
							max="20"
							defaultValue="1"
							onKeyPress={(e) => {
								if (e.key === "Enter") {
									handleGotoStep(e.target.value);
								}
							}}
						/>
						<button
							onClick={() => {
								const input = document.getElementById("step-input");
								handleGotoStep(input.value);
							}}
						>
							Go
						</button>
					</div>
				</div>

				<div className="admin-section">
					<h2>System Information</h2>
					<div className="system-info">
						<div className="info-item">
							<label>Server URL:</label>
							<span>
								{APP_CONFIG.SERVER_URL}
							</span>
						</div>
						<div className="info-item">
							<label>User Agent:</label>
							<span>{navigator.userAgent}</span>
						</div>
						<div className="info-item">
							<label>Screen Resolution:</label>
							<span>
								{window.screen.width} x {window.screen.height}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminPanel;
