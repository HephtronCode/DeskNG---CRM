import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [60, "Category name must not exceed 60 characters"],
    },

    code: {
      type: String,
      required: [true, "Category code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, "Category code must not exceed 10 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [255, "Category description must not exceed 255 characters"],
      default: "",
    },
    subcategories: {
      type: [String],
      default: [],
    },
    defaultPriority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    slaHours: {
      type: Number,
      required: [true, "SLA turnaround hours are required"],
      min: [1, "SLA turnaround hours must be at least 1   hour"],
      default: 24,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Category = mongoose.model("Category", categorySchema);
