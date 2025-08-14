const mongoose = require("mongoose");

// Load environment variables
require("dotenv").config();

const MONGODB_URI =
	process.env.MONGODB_URI ||
	"mongodb+srv://rjbulcher:BkfvbQmMeu2KGC3f@main.lurvagf.mongodb.net/alliance-demo?retryWrites=true&w=majority&appName=main";

const connectDB = async () => {
	try {
		console.log("🔌 Attempting to connect to MongoDB...");

		const conn = await mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
		});

		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

		// Handle connection events
		mongoose.connection.on("error", (err) => {
			console.error("❌ MongoDB connection error:", err);
		});

		mongoose.connection.on("disconnected", () => {
			console.log("⚠️ MongoDB disconnected");
		});

		mongoose.connection.on("reconnected", () => {
			console.log("🔄 MongoDB reconnected");
		});

		return conn;
	} catch (error) {
		console.error("❌ Error connecting to MongoDB:", error.message);
		console.log("🔄 Application will continue in OFFLINE MODE (no analytics)");
		return null; // Return null instead of crashing
	}
};

const disconnectDB = async () => {
	try {
		await mongoose.disconnect();
		console.log("🔌 MongoDB disconnected");
	} catch (error) {
		console.error("❌ Error disconnecting from MongoDB:", error);
	}
};

module.exports = {
	connectDB,
	disconnectDB,
};
