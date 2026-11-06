import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Ticket subject is required"],
      trim: true,
      minlength: [5, "Subject must be at least 5 chars"],
      maxlength: [120, "Subject max is 120 chars"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 chars"],
    },
    status: {
      type: String,
      enum: [
        "open",
        "on_hold",
        "escalated",
        "closed",
        "archived",
      ],
      default: "open",
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "incident",
        "service_request",
        "inquiry",
        "complaint",
      ],
      required: true,
      trim: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    subcategory: {
      type: String,
      required: [true, "Subcategory is required"],
      trim: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester is required"],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    escalationReason: {
      type: String,
      default: null,
      trim: true,
    },
    dueAt: {
      type: Date,
      required: [true, "SLA due date is required"],
    },
    closedAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index optimizes the support queue listing.
ticketSchema.index({ status: 1, priority: -1, createdAt: -1 });

export const Ticket = mongoose.model("Ticket", ticketSchema);
