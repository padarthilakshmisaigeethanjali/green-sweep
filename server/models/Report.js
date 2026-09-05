const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "garbage",
        "illegal_dumping",
        "damaged_public_property",
        "overflowing_bin",
        "other",
      ],
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "reported",
        "under_review",
        "assigned",
        "cleanup_in_progress",
        "completed",
      ],
      default: "reported",
    },
  },
  {
    timestamps: true,
  },
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
