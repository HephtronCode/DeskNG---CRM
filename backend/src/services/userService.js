import { User } from "../models/User.js";

// Active staff lookup for assignment dropdowns (agent + admin).
// Only active accounts are returned so the UI never offers
// deactivated staff for ticket assignment.
export const getActiveStaff = async () =>
  User.find({
    role: { $in: ["agent", "admin"] },
    isActive: true,
  })
    .select("name email role department")
    .sort({ name: 1 });
