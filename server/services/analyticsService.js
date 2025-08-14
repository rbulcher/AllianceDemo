const { DailyAnalytics, SystemAnalytics } = require("../models/Analytics");

class AnalyticsService {
	constructor() {
		this.systemAnalytics = null;
		this.init();
	}

	// Initialize system analytics
	async init() {
		try {
			// Get or create system analytics record
			this.systemAnalytics = await SystemAnalytics.findOne({ id: "system" });
			if (!this.systemAnalytics) {
				this.systemAnalytics = new SystemAnalytics({
					id: "system",
					totalScenarios: 0,
					totalSessions: 0,
					systemUptime: 0,
				});
				await this.systemAnalytics.save();
				console.log("📊 Created new system analytics record");
			} else {
				console.log("📊 Loaded existing system analytics");
			}
		} catch (error) {
			console.error("❌ Error initializing analytics service:", error.message);
			console.log("🔄 Analytics service will run in offline mode");
			this.systemAnalytics = null;
		}
	}

	// Get today's date string
	getTodayDateString() {
		return new Date().toISOString().split("T")[0];
	}

	// Record a scenario start
	async recordScenarioStart(scenarioId) {
		try {
			// Skip if database is not available
			if (!this.systemAnalytics) {
				console.log(
					`📊 Skipping analytics recording (offline mode): ${scenarioId}`
				);
				return { success: false, offline: true };
			}

			const today = this.getTodayDateString();
			const now = new Date();

			console.log(`📊 Recording scenario start: ${scenarioId} for ${today}`);

			// Use atomic operations to ensure data consistency
			let dailyAnalytics = await DailyAnalytics.findOne({ date: today });

			if (!dailyAnalytics) {
				// Create new daily analytics document
				dailyAnalytics = new DailyAnalytics({
					date: today,
					totalScenarios: 1,
					scenarioStats: [
						{
							scenarioId: scenarioId,
							starts: 1,
							completions: 0,
						},
					],
					lastActivity: now,
				});
				await dailyAnalytics.save();
			} else {
				// Check if scenario already exists in stats
				const existingScenarioIndex = dailyAnalytics.scenarioStats.findIndex(
					(stat) => stat.scenarioId === scenarioId
				);

				if (existingScenarioIndex === -1) {
					// Scenario doesn't exist, add it
					await DailyAnalytics.updateOne(
						{ date: today },
						{
							$push: {
								scenarioStats: {
									scenarioId: scenarioId,
									starts: 1,
									completions: 0,
								},
							},
							$inc: { totalScenarios: 1 },
							$set: { lastActivity: now },
						}
					);
				} else {
					// Scenario exists, increment starts count
					await DailyAnalytics.updateOne(
						{ date: today, "scenarioStats.scenarioId": scenarioId },
						{
							$inc: {
								"scenarioStats.$.starts": 1,
								totalScenarios: 1,
							},
							$set: { lastActivity: now },
						}
					);
				}
			}

			// Update system analytics
			if (this.systemAnalytics) {
				this.systemAnalytics.totalScenarios += 1;
				this.systemAnalytics.lastActivity = now;
				await this.systemAnalytics.save();
			}

			// Verify the save by re-fetching from database
			const verification = await DailyAnalytics.findOne({ date: today });
			if (verification) {
				const verifyScenarioStat = verification.scenarioStats.find(
					(stat) => stat.scenarioId === scenarioId
				);
				console.log(
					`🔍 Database verification - starts: ${
						verifyScenarioStat ? verifyScenarioStat.starts : "NOT FOUND"
					}, total: ${verification.totalScenarios}`
				);
			} else {
				console.log(
					`❌ Database verification failed - no document found for ${today}`
				);
			}

			console.log(`✅ Recorded scenario start: ${scenarioId}`);
			return {
				success: true,
			};
		} catch (error) {
			console.error("❌ Error recording scenario start:", error.message);
			console.log("🔄 Continuing in offline mode...");
			return { success: false, error: error.message, offline: true };
		}
	}

	// Record a scenario completion
	async recordScenarioCompletion(scenarioId) {
		try {
			// Skip if database is not available
			if (!this.systemAnalytics) {
				console.log(
					`📊 Skipping completion recording (offline mode): ${scenarioId}`
				);
				return { success: false, offline: true };
			}

			const today = this.getTodayDateString();
			const now = new Date();

			console.log(
				`📊 Recording scenario completion: ${scenarioId} for ${today}`
			);

			// Update daily analytics
			let dailyAnalytics = await DailyAnalytics.findOne({ date: today });

			if (!dailyAnalytics) {
				// If no daily analytics exist, create one but don't increment totals
				dailyAnalytics = new DailyAnalytics({
					date: today,
					totalScenarios: 0,
					scenarioStats: [],
					lastActivity: now,
				});
			}

			// Find scenario stats for this day
			let scenarioStat = dailyAnalytics.scenarioStats.find(
				(stat) => stat.scenarioId === scenarioId
			);
			if (!scenarioStat) {
				// Create stat entry if it doesn't exist
				scenarioStat = {
					scenarioId: scenarioId,
					starts: 0,
					completions: 0,
				};
				dailyAnalytics.scenarioStats.push(scenarioStat);
			}

			// Increment completion counter
			scenarioStat.completions += 1;
			dailyAnalytics.lastActivity = now;

			// Mark the subdocument array as modified to ensure it saves
			dailyAnalytics.markModified("scenarioStats");

			await dailyAnalytics.save();

			// Update system analytics
			if (this.systemAnalytics) {
				this.systemAnalytics.lastActivity = now;
				await this.systemAnalytics.save();
			}

			console.log(`✅ Recorded scenario completion: ${scenarioId}`);
			return {
				success: true,
				dailyAnalytics,
				systemAnalytics: this.systemAnalytics,
			};
		} catch (error) {
			console.error("❌ Error recording scenario completion:", error.message);
			console.log("🔄 Continuing in offline mode...");
			return { success: false, error: error.message, offline: true };
		}
	}

	// Get all analytics data
	async getAllAnalytics() {
		try {
			// Return empty data if offline
			if (!this.systemAnalytics) {
				console.log("📊 Returning empty analytics (offline mode)");
				return {
					dailyData: {},
					totalScenarios: 0,
					totalSessions: 0,
					systemUptime: Math.floor(process.uptime()),
					lastActivity: null,
					offline: true,
				};
			}

			const dailyData = await DailyAnalytics.find({}).sort({ date: -1 }); // Most recent first
			const systemData = await SystemAnalytics.findOne({ id: "system" });

			console.log(
				`🔍 getAllAnalytics: Found ${dailyData.length} daily records`
			);

			// Transform daily data to match frontend format
			const dailyDataFormatted = {};
			dailyData.forEach((day) => {
				const scenarioStats = {};
				console.log(
					`🔍 Processing day ${day.date} with ${day.scenarioStats.length} scenario stats, totalScenarios: ${day.totalScenarios}`
				);

				day.scenarioStats.forEach((stat) => {
					console.log(
						`🔍 Scenario stat: ${stat.scenarioId} - starts: ${stat.starts}, completions: ${stat.completions}`
					);
					scenarioStats[stat.scenarioId] = {
						starts: stat.starts,
						completions: stat.completions,
					};
				});

				dailyDataFormatted[day.date] = {
					totalScenarios: day.totalScenarios,
					scenarioStats: scenarioStats,
					lastActivity: day.lastActivity,
				};
			});

			// Get today's data for current state
			const today = this.getTodayDateString();
			const todayData = dailyDataFormatted[today] || {
				totalScenarios: 0,
				scenarioStats: {},
				lastActivity: null,
			};

			console.log(`🔍 Today's data (${today}):`, todayData);

			return {
				success: true,
				data: {
					systemUptime: systemData ? systemData.systemUptime : 0,
					totalScenarios: systemData ? systemData.totalScenarios : 0,
					scenarioStats: todayData.scenarioStats,
					lastActivity: systemData ? systemData.lastActivity : null,
					dailyData: dailyDataFormatted,
					connectedDevices: [], // This will be populated from real-time data
				},
			};
		} catch (error) {
			console.error("❌ Error getting analytics:", error.message);
			console.log("🔄 Returning empty analytics (offline mode)");
			return {
				dailyData: {},
				totalScenarios: 0,
				totalSessions: 0,
				systemUptime: Math.floor(process.uptime()),
				lastActivity: null,
				offline: true,
				error: error.message,
			};
		}
	}

	// Get analytics for a specific date
	async getAnalyticsForDate(dateString) {
		try {
			const dailyAnalytics = await DailyAnalytics.findOne({ date: dateString });

			if (!dailyAnalytics) {
				return {
					success: true,
					data: {
						totalScenarios: 0,
						scenarioStats: {},
						lastActivity: null,
					},
				};
			}

			const scenarioStats = {};
			dailyAnalytics.scenarioStats.forEach((stat) => {
				scenarioStats[stat.scenarioId] = {
					starts: stat.starts,
					completions: stat.completions,
				};
			});

			return {
				success: true,
				data: {
					totalScenarios: dailyAnalytics.totalScenarios,
					scenarioStats: scenarioStats,
					lastActivity: dailyAnalytics.lastActivity,
				},
			};
		} catch (error) {
			console.error("❌ Error getting analytics for date:", error);
			return { success: false, error: error.message };
		}
	}

	// Clear all analytics data (for testing/reset)
	async clearAllAnalytics() {
		try {
			await DailyAnalytics.deleteMany({});
			await SystemAnalytics.deleteMany({});

			// Reinitialize
			await this.init();

			console.log("🗑️ Cleared all analytics data");
			return { success: true };
		} catch (error) {
			console.error("❌ Error clearing analytics:", error);
			return { success: false, error: error.message };
		}
	}

	// Update system uptime
	async updateSystemUptime(uptimeSeconds) {
		try {
			if (this.systemAnalytics) {
				this.systemAnalytics.systemUptime = uptimeSeconds;
				await this.systemAnalytics.save();
			}
		} catch (error) {
			console.error("❌ Error updating system uptime:", error);
		}
	}
}

module.exports = AnalyticsService;
