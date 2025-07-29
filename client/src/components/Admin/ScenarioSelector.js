import React from "react";
import { getAllScenarios } from "../../data/scenarios";
import { useSocket } from "../../hooks/useSocket";
import { ROUTES } from "../../utils/constants";
import "./ScenarioSelector.css";

const ScenarioSelector = () => {
	const { startScenario, isConnected } = useSocket("admin");
	const scenarios = getAllScenarios();

	const handleScenarioSelect = (scenarioId) => {
		startScenario(scenarioId);
		// Redirect to appropriate view based on device
		const userAgent = navigator.userAgent;
		const isIPad =
			/iPad/.test(userAgent) ||
			(/Macintosh/.test(userAgent) && "ontouchend" in document);

		if (isIPad) {
			window.location.href = ROUTES.CONTROLLER;
		} else {
			window.location.href = ROUTES.DISPLAY;
		}
	};

	return (
		<div className="scenario-selector">
			<div className="header">
				<h1>Alliance Commercial Laundry Demo</h1>
				<div className="connection-status">
					{isConnected ? (
						<span className="connected">🟢 Connected</span>
					) : (
						<span className="disconnected">🔴 Connecting...</span>
					)}
				</div>
			</div>

			<div className="scenarios-grid">
				{scenarios.map((scenario) => (
					<div
						key={scenario.id}
						className="scenario-card"
						onClick={() => handleScenarioSelect(scenario.id)}
					>
						<div className="scenario-header">
							<h3>{scenario.title}</h3>
							<div className="scenario-meta">
								<span className="steps">{scenario.totalSteps} steps</span>
								<span className="time">{scenario.estimatedTime}</span>
							</div>
						</div>
						<p className="scenario-description">{scenario.description}</p>
						<button className="start-button">Start Demo</button>
					</div>
				))}
			</div>

			<div className="footer">
				<button
					className="admin-button"
					onClick={() => (window.location.href = ROUTES.ADMIN)}
				>
					Admin Panel
				</button>
			</div>
		</div>
	);
};

export default ScenarioSelector;
