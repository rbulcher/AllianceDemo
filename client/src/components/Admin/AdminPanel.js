import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSocket } from "../../hooks/useSocket";
import { getAllScenarios } from "../../data/scenarios";
import { ROUTES, APP_CONFIG } from "../../utils/constants";
import { getServerUrl } from "../../utils/serverConfig";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
} from "recharts";
import "./AdminPanel.css";

const SERVER_URL = getServerUrl();

const AdminPanel = () => {
	const {
		demoState,
		adminReset,
		adminGotoStep,
		startScenario,
		isConnected,
		connectionAttempts,
		forceReconnect,
		socket,
	} = useSocket("admin");

	const scenarios = getAllScenarios();

	// Helper function to get today's date string
	const getTodayDateString = () => {
		return new Date().toISOString().split("T")[0]; // Format: "2025-01-15"
	};

	// Admin analytics state
	const [analytics, setAnalytics] = useState({
		systemUptime: 0,
		totalScenarios: 0,
		scenarioStats: {},
		connectedDevices: [],
		systemErrors: [],
		lastActivity: null,
		memoryUsage: null,
		serverStatus: "unknown",
		dailyData: {}, // Structure: { "2025-01-15": { totalScenarios: 5, scenarioStats: {...}, lastActivity: "..." } }
	});

	const [expandedDays, setExpandedDays] = useState(() => {
		const today = new Date().toISOString().split("T")[0];
		return new Set([today]);
	});

	// Initialize today as expanded on mount only (no dependencies to prevent rerenders)
	useEffect(() => {
		const today = getTodayDateString();
		setExpandedDays((prev) => {
			if (!prev.has(today)) {
				const newSet = new Set(prev);
				newSet.add(today);
				return newSet;
			}
			return prev;
		});
	}, []); // Empty dependency array - only run once on mount

	const [selectedScenario, setSelectedScenario] = useState("");
	const [targetStep, setTargetStep] = useState(1);
	const [showAdvanced, setShowAdvanced] = useState(false);

	// Load persistent analytics data from REST API on mount
	useEffect(() => {
		const loadPersistentAnalytics = async () => {
			try {
				console.log("📊 Loading persistent analytics from database...");
				const response = await fetch(`${SERVER_URL}/api/analytics`);
				if (response.ok) {
					const data = await response.json();
					if (data.offline) {
						console.log("🔄 Running in offline mode - analytics disabled");
					} else {
						console.log("✅ Loaded persistent analytics:", data);
					}
					setAnalytics((prev) => ({ ...prev, ...data }));
				} else {
					console.warn(
						"⚠️ Failed to load persistent analytics:",
						response.status,
						"- continuing in offline mode"
					);
				}
			} catch (error) {
				console.warn("⚠️ Error loading persistent analytics:", error.message);
				console.log("🔄 Continuing in offline mode...");
			}
		};

		loadPersistentAnalytics();
	}, []); // Run once on mount

	// Initialize analytics fetching and track scenario starts
	useEffect(() => {
		if (socket && isConnected) {
			console.log("🔌 Admin panel socket connected, setting up listeners...");

			// Request initial analytics data (will complement REST API data with real-time info)
			socket.emit("admin-get-analytics");

			// Set up analytics data listeners
			socket.on("analytics-update", (data) => {
				console.log("📈 Analytics update received:", data);
				setAnalytics((prev) => {
					// Smart update - only update changed values to prevent unnecessary re-renders
					const updated = { ...prev };

					// Compare and update only changed fields
					if (data.totalScenarios !== prev.totalScenarios) {
						updated.totalScenarios = data.totalScenarios;
					}

					// Smart scenario stats update
					if (
						JSON.stringify(data.scenarioStats) !==
						JSON.stringify(prev.scenarioStats)
					) {
						updated.scenarioStats = { ...data.scenarioStats };
					}

					// Update other fields that typically change
					if (data.connectedDevices) {
						updated.connectedDevices = data.connectedDevices;
					}

					if (data.lastActivity !== prev.lastActivity) {
						updated.lastActivity = data.lastActivity;
					}

					if (data.dailyData) {
						updated.dailyData = { ...prev.dailyData, ...data.dailyData };
					}

					return updated;
				});
			});

			socket.on("system-stats", (stats) => {
				setAnalytics((prev) => ({
					...prev,
					systemUptime: stats.uptime,
					memoryUsage: stats.memory,
					serverStatus: stats.status,
				}));
			});

			socket.on("device-list", (devices) => {
				setAnalytics((prev) => ({ ...prev, connectedDevices: devices }));
			});

			socket.on("error-log", (error) => {
				setAnalytics((prev) => ({
					...prev,
					systemErrors: [
						...prev.systemErrors.slice(-9),
						{
							...error,
							timestamp: new Date().toISOString(),
						},
					],
				}));
			});

			// Listen for device connections/disconnections
			socket.on("device-connected", (deviceInfo) => {
				setAnalytics((prev) => {
					const newDevices = prev.connectedDevices.filter(
						(d) => d.id !== deviceInfo.id
					);
					return {
						...prev,
						connectedDevices: [...newDevices, deviceInfo],
					};
				});
			});

			socket.on("device-disconnected", (deviceId) => {
				setAnalytics((prev) => ({
					...prev,
					connectedDevices: prev.connectedDevices.filter(
						(d) => d.id !== deviceId
					),
				}));
			});


			// Cleanup listeners
			return () => {
				socket.off("analytics-update");
				socket.off("system-stats");
				socket.off("device-list");
				socket.off("error-log");
				socket.off("device-connected");
				socket.off("device-disconnected");
			};
		}
	}, [socket, isConnected]);

	// Admin action handlers
	const handleReset = () => {
		if (
			window.confirm(
				"⚠️ HARD RESET: This will reset the demo and clear all sessions. Continue?"
			)
		) {
			adminReset();
			// Also request analytics refresh
			setTimeout(() => {
				if (socket) socket.emit("admin-get-analytics");
			}, 1000);
		}
	};

	const handleGotoStep = (step) => {
		const stepNumber = parseInt(step || targetStep);
		if (!isNaN(stepNumber) && stepNumber > 0) {
			adminGotoStep(stepNumber - 1); // Convert to 0-based indexing
			setTargetStep(stepNumber);
		}
	};

	const handleStartScenario = (scenarioId) => {
		const id = scenarioId || selectedScenario;
		if (id) {
			startScenario(id);
			setSelectedScenario(id);
		}
	};

	const handleForceReconnect = () => {
		if (
			window.confirm(
				"Force reconnect all connections? This may briefly interrupt the demo."
			)
		) {
			forceReconnect();
		}
	};


	const handleClearErrors = () => {
		setAnalytics((prev) => ({ ...prev, systemErrors: [] }));
		if (socket) socket.emit("admin-clear-errors");
	};

	const formatUptime = (seconds) => {
		if (!seconds) return "Unknown";
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);
		return `${hours}h ${minutes}m ${secs}s`;
	};

	const formatMemory = (bytes) => {
		if (!bytes) return "Unknown";
		const mb = (bytes / 1024 / 1024).toFixed(1);
		return `${mb} MB`;
	};

	const getCurrentScenarioInfo = () => {
		if (!demoState.currentScenario) return null;
		return scenarios.find((s) => s.id === demoState.currentScenario);
	};

	// Helper function to get scenario display name
	const getScenarioDisplayName = (scenarioId) => {
		const scenarioNumber = scenarioId.replace("scenario", "");
		return `Scenario ${scenarioNumber}`;
	};

	// Helper function to format date for display
	const formatDateDisplay = (dateString) => {
		const date = new Date(dateString);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (dateString === getTodayDateString()) {
			return "Today";
		} else if (dateString === yesterday.toISOString().split("T")[0]) {
			return "Yesterday";
		} else {
			return date.toLocaleDateString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}
	};

	// Helper function to toggle day expansion - memoized to prevent recreation
	const toggleDayExpansion = useCallback((dateString) => {
		setExpandedDays((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(dateString)) {
				newSet.delete(dateString);
			} else {
				newSet.add(dateString);
			}
			return newSet;
		});
	}, []);

	// Chart data preparation for specific day - memoized to prevent unnecessary recalculations
	const getBarChartData = useCallback((dayData = analytics) => {
		const scenarioStats = dayData.scenarioStats || {};
		return Object.entries(scenarioStats).map(([scenarioId, stats]) => {
			const displayName = getScenarioDisplayName(scenarioId);
			return {
				name: displayName,
				scenarios: stats.starts || 0,
				shortName: displayName,
			};
		});
	}, []);

	const getPieChartData = useCallback((dayData = analytics) => {
		const scenarioStats = dayData.scenarioStats || {};
		const data = Object.entries(scenarioStats).map(([scenarioId, stats]) => {
			const displayName = getScenarioDisplayName(scenarioId);
			return {
				name: displayName,
				value: stats.starts || 0,
				shortName: displayName,
			};
		});
		return data.filter((item) => item.value > 0);
	}, []);

	// Get sorted daily data (most recent first)
	const getSortedDailyData = () => {
		const today = getTodayDateString();
		const dataEntries = Object.entries(analytics.dailyData);

		// Always ensure today's date is included, even if no data yet
		const hasToday = dataEntries.some(([date]) => date === today);
		if (!hasToday) {
			dataEntries.push([
				today,
				{ totalScenarios: 0, scenarioStats: {}, lastActivity: null },
			]);
		}

		return dataEntries.sort(([dateA], [dateB]) => dateB.localeCompare(dateA)); // Sort descending (newest first)
	};

	// Chart colors
	const CHART_COLORS = [
		"#00d4ff",
		"#28a745",
		"#ffc107",
		"#dc3545",
		"#6f42c1",
		"#fd7e14",
	];

	// Memoized chart components to prevent unnecessary re-renders
	const MemoizedBarChart = React.memo(({ data, dateString }) => (
		<ResponsiveContainer width="100%" height={250}>
			<BarChart
				key={`bar-chart-${dateString}`} // Stable key based only on date
				data={data}
				margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
			>
				<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
				<XAxis
					dataKey="shortName"
					tick={{ fill: "#bdc3c7", fontSize: 12 }}
					axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
				/>
				<YAxis
					tick={{ fill: "#bdc3c7", fontSize: 12 }}
					axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
				/>
				<Tooltip content={<CustomTooltip />} />
				<Bar
					dataKey="scenarios"
					fill="#00d4ff"
					radius={[4, 4, 0, 0]}
					isAnimationActive={false}
				/>
			</BarChart>
		</ResponsiveContainer>
	));

	const MemoizedPieChart = React.memo(({ data, dateString }) => (
		<ResponsiveContainer width="100%" height={250}>
			<PieChart key={`pie-chart-${dateString}`}>
				{" "}
				{/* Stable key based only on date */}
				<Pie
					data={data}
					cx="50%"
					cy="50%"
					outerRadius={80}
					dataKey="value"
					label={({ shortName, value }) => `${shortName}: ${value}`}
					labelLine={false}
					isAnimationActive={false}
				>
					{data.map((entry, index) => (
						<Cell
							key={entry.name} // Stable key based on scenario name
							fill={CHART_COLORS[index % CHART_COLORS.length]}
						/>
					))}
				</Pie>
				<Tooltip content={<CustomTooltip />} />
			</PieChart>
		</ResponsiveContainer>
	));

	// Custom tooltip for charts
	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			return (
				<div className="chart-tooltip">
					<p className="tooltip-label">{label}</p>
					<p className="tooltip-value">
						{payload[0].value} scenario{payload[0].value !== 1 ? "s" : ""}{" "}
						started
					</p>
				</div>
			);
		}
		return null;
	};

	// Component for daily analytics display - memoized to prevent unnecessary re-renders
	const DailyAnalyticsDisplay = React.memo(
		({ dateString, dayData, isExpanded, isToday = false }) => {
			const totalScenarios = dayData.totalScenarios || 0;
			const lastActivity = dayData.lastActivity;

			return (
				<div className={`daily-analytics ${isToday ? "today" : ""}`}>
					<div
						className="daily-header"
						onClick={() => toggleDayExpansion(dateString)}
					>
						<div className="daily-date">
							<span className="date-label">
								{formatDateDisplay(dateString)}
							</span>
							<span className="date-raw">({dateString})</span>
						</div>
						<div className="daily-summary">
							<span className="scenario-count">{totalScenarios} scenarios</span>
							{lastActivity && (
								<span className="last-activity">
									Last: {new Date(lastActivity).toLocaleTimeString()}
								</span>
							)}
						</div>
						<div className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
							{isExpanded ? "▼" : "▶"}
						</div>
					</div>

					{isExpanded && (
						<div className="daily-content">
							<div className="charts-container">
								<div className="chart-section">
									<h3>Scenarios Started (Bar Chart)</h3>
									<div className="chart-wrapper">
										{getBarChartData(dayData).length > 0 ? (
											<MemoizedBarChart
												data={getBarChartData(dayData)}
												dateString={dateString}
											/>
										) : (
											<div className="no-data">
												<p>No scenarios started</p>
												<p className="no-data-sub">No activity on this day</p>
											</div>
										)}
									</div>
								</div>

								<div className="chart-section">
									<h3>Distribution (Pie Chart)</h3>
									<div className="chart-wrapper">
										{getPieChartData(dayData).length > 0 ? (
											<MemoizedPieChart
												data={getPieChartData(dayData)}
												dateString={dateString}
											/>
										) : (
											<div className="no-data">
												<p>No data to display</p>
												<p className="no-data-sub">
													No scenarios started on this day
												</p>
											</div>
										)}
									</div>
								</div>
							</div>

							<div className="summary-stats">
								<div className="stat-card total-card">
									<div className="stat-number">{totalScenarios}</div>
									<div className="stat-label">Total Scenarios</div>
									<div className="stat-time">
										{lastActivity
											? `Last: ${new Date(lastActivity).toLocaleTimeString()}`
											: "No activity"}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			);
		}
	);

	const currentScenario = getCurrentScenarioInfo();

	return (
		<div className="admin-panel-container">
			<div className="admin-panel">
				<div className="admin-header">
					<h1>Alliance Demo - Remote Admin</h1>
					<div className="connection-status">
						{isConnected ? (
							<span className="device-connected">Online</span>
						) : (
							<span className="device-disconnected">Disconnected</span>
						)}
					</div>
				</div>

				<div className="admin-content">
					{/* HARD RESET */}
					<div className="admin-section reset-section">
						<div className="reset-controls">
							<button className="reset-button" onClick={handleReset}>
								Hard Reset Demo
							</button>
							<div className="reset-info">
								<div>
									Current Status:{" "}
									{demoState.currentScenario ? (
										<span className="status-active">
											{currentScenario?.title || demoState.currentScenario} -
											Step {demoState.currentStep + 1}
											{currentScenario && ` of ${currentScenario.totalSteps}`}
											{demoState.isVideoPlaying && " (Video Playing)"}
										</span>
									) : (
										<span className="status-idle">Demo Idle</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* REMOTE NAVIGATION */}
					<div className="admin-section">
						<h2>Remote Navigation</h2>
						<div className="navigation-controls">
							<div className="control-row">
								<div className="control-group">
									<label>Select Scenario:</label>
									<select
										value={selectedScenario}
										onChange={(e) => setSelectedScenario(e.target.value)}
										className="scenario-select"
									>
										<option value="">Choose scenario...</option>
										{scenarios.map((scenario) => (
											<option key={scenario.id} value={scenario.id}>
												{scenario.title} ({scenario.totalSteps} steps)
											</option>
										))}
									</select>
								</div>
								<div className="control-group">
									<label>Select Step:</label>
									<input
										type="number"
										min="1"
										max="30"
										value={targetStep}
										onChange={(e) => setTargetStep(parseInt(e.target.value))}
										className="step-input"
										placeholder="Step #"
									/>
								</div>
								<div className="control-group">
									<button
										className="launch-button"
										onClick={() => {
											if (selectedScenario && targetStep) {
												handleStartScenario();
												handleGotoStep();
											} else if (selectedScenario) {
												handleStartScenario();
											} else if (targetStep) {
												handleGotoStep();
											}
										}}
										disabled={!selectedScenario && !targetStep}
									>
										Launch
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* CONNECTED DEVICES */}
					<div className="admin-section">
						<h2>Connected Devices</h2>
						<div className="devices-grid">
							<div className="device-status">
								<div className="device-type">Controller (iPad)</div>
								<div className="device-info">
									{analytics.connectedDevices.find(
										(d) => d.type === "controller"
									) ? (
										<span className="device-connected">Connected</span>
									) : (
										<span className="device-disconnected">Disconnected</span>
									)}
								</div>
							</div>
							<div className="device-status">
								<div className="device-type">Display (TV)</div>
								<div className="device-info">
									{analytics.connectedDevices.find(
										(d) => d.type === "display"
									) ? (
										<span className="device-connected">Connected</span>
									) : (
										<span className="device-disconnected">Disconnected</span>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* ANALYTICS DASHBOARD */}
					<div className="admin-section">
						<h2>
							Analytics Dashboard
							{analytics.offline && (
								<span className="offline-indicator"> (Offline Mode)</span>
							)}
						</h2>
						{analytics.offline && (
							<div className="offline-notice">
								<p>⚠️ Analytics are disabled - running in offline mode</p>
							</div>
						)}
						<div className="daily-analytics-container">
							{getSortedDailyData().length > 0 ? (
								getSortedDailyData().map(([dateString, dayData]) => (
									<DailyAnalyticsDisplay
										key={dateString}
										dateString={dateString}
										dayData={dayData}
										isExpanded={expandedDays.has(dateString)}
										isToday={dateString === getTodayDateString()}
									/>
								))
							) : (
								<div className="no-daily-data">
									<h3>
										{analytics.offline
											? "Analytics disabled in offline mode"
											: "No analytics data yet"}
									</h3>
									<p>
										{analytics.offline
											? "Database connection unavailable"
											: "Start a scenario to begin tracking daily analytics"}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminPanel;
