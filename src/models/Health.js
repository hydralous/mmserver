const mongoose = require("mongoose");

const healthSchema = new mongoose.Schema(
  {
    hostname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    osType: {
      type: String,
      required: true,
    },
    osRelease: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    remotePosition: {
      country: String,
      countryCode: String,
      region: String,
      city: String,
      zip: String,
      latitude: Number,
      longitude: Number,
      timezone: String,
      isp: String,
      org: String,
    },
    status: {
      type: String,
      default: "ok",
    },
    message: {
      type: String,
      default: "Server is running",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create index on hostname and createdAt for faster queries
healthSchema.index({ hostname: 1, createdAt: -1 });
healthSchema.index({ createdAt: -1 });

const Health = mongoose.model("Health", healthSchema);

module.exports = Health;

