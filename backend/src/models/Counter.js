import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 1000,
  },
});

export const Counter = mongoose.model("Counter", counterSchema);

export const getNextTicketNumber = async (prefix = "TKT") => {
  const counter = await Counter.findByIdAndUpdate(
    "ticket_seq",
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return `${prefix}-${counter.seq}`;
};
