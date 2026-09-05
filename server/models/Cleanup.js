const mongoose = require("mongoose");

const cleanupSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },

    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    proofImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["claimed", "in_progress", "submitted", "verified", "rejected"],
      default: "claimed",
    },

    pointsAwarded: {
      type: Number,
      default: 0,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Cleanup = mongoose.model("Cleanup", cleanupSchema);

module.exports = Cleanup;
