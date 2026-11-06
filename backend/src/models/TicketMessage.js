import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: [true, "Ticket is required"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    body: {
      type: String,
      required: [true, "Message body is required"],
      trim: true,
      minlength: [1, "Message body cannot be empty"],
      maxlength: [5000, "Message body must not exceed 5000 chars"],
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const TicketMessage = mongoose.model(
  "TicketMessage",
  ticketMessageSchema,
);
