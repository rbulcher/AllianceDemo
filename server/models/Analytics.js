const mongoose = require('mongoose');

// Schema for individual scenario statistics
const ScenarioStatsSchema = new mongoose.Schema({
  scenarioId: {
    type: String,
    required: true
  },
  starts: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  }
});

// Schema for daily analytics data
const DailyAnalyticsSchema = new mongoose.Schema({
  date: {
    type: String, // Format: "2025-01-15"
    required: true,
    unique: true
  },
  totalScenarios: {
    type: Number,
    default: 0
  },
  scenarioStats: [ScenarioStatsSchema],
  lastActivity: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Schema for system analytics (overall metrics)
const SystemAnalyticsSchema = new mongoose.Schema({
  id: {
    type: String,
    default: 'system',
    unique: true
  },
  totalScenarios: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  systemUptime: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps before saving
DailyAnalyticsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

SystemAnalyticsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const DailyAnalytics = mongoose.model('DailyAnalytics', DailyAnalyticsSchema);
const SystemAnalytics = mongoose.model('SystemAnalytics', SystemAnalyticsSchema);

module.exports = {
  DailyAnalytics,
  SystemAnalytics
};