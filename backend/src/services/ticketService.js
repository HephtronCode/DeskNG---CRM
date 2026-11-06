import { Ticket } from "../models/Ticket.js";
import { Category } from "../models/Category.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { getNextTicketNumber } from "../models/Counter.js";

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

const populateFields = [
  { path: "category", select: "name code slaHours" },
  { path: "requester", select: "name email role" },
  { path: "assignedTo", select: "name email role department" },
];

export const createTicket = async (data, requesterId) => {
  const category = await Category.findById(data.category);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const validSubcategory = category.subcategories.includes(
    data.subcategory,
  );
  if (!validSubcategory) {
    throw new AppError(
      "Subcategory does not belong to this category",
      400,
    );
  }

  const ticketNumber = await getNextTicketNumber("TKT");
  const dueAt = new Date(
    Date.now() + category.slaHours * MILLISECONDS_PER_HOUR,
  );

  const ticket = await Ticket.create({
    ticketNumber,
    subject: data.subject,
    description: data.description,
    type: data.type,
    category: data.category,
    subcategory: data.subcategory,
    priority: data.priority || category.defaultPriority,
    requester: requesterId,
    dueAt,
  });

  return ticket.populate(populateFields);
};

export const getTicketById = async (id, userRole, userId) => {
  const ticket = await Ticket.findById(id).populate(populateFields);

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (
    userRole === "customer" &&
    ticket.requester._id.toString() !== userId.toString()
  ) {
    throw new AppError("You can only view your own tickets", 403);
  }

  return ticket;
};

export const getTickets = async (query, userRole, userId) => {
  const {
    status, priority, type, category, assignedTo,
    search, page, limit, includeArchived,
  } = query;

  const filter = {};

  if (userRole === "customer") {
    filter.requester = userId;
  }

  if (!includeArchived) {
    filter.status = { $ne: "archived" };
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (assignedTo) filter.assignedTo = assignedTo;

  if (search) {
    filter.$or = [
      { ticketNumber: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);

  const meta = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };

  return { tickets, meta };
};

export const updateTicketStatus = async (
  id, status, userRole, userId, escalationReason,
) => {
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (ticket.status === "archived") {
    throw new AppError("Archived tickets cannot be modified", 400);
  }

  if (userRole === "customer") {
    if (ticket.requester.toString() !== userId.toString()) {
      throw new AppError("You can only modify your own tickets", 403);
    }
    if (status !== "closed") {
      throw new AppError(
        "Customers can only close their own tickets",
        403,
      );
    }
  }

  if (status === "escalated") {
    if (
      !escalationReason ||
      escalationReason.trim().length < 5
    ) {
      throw new AppError(
        "Escalation requires a reason of at least 5 characters",
        400,
      );
    }
    ticket.escalationReason = escalationReason.trim();
  }

  if (status === "archived") {
    if (userRole !== "admin") {
      throw new AppError("Only admins can archive tickets", 403);
    }
    if (ticket.status !== "closed") {
      throw new AppError("Only closed tickets can be archived", 400);
    }
    ticket.archivedAt = new Date();
  }

  if (status === "closed") {
    ticket.closedAt = new Date();
  }
  if (ticket.status === "closed" && status === "open") {
    ticket.closedAt = null;
  }

  ticket.status = status;
  await ticket.save();

  return ticket.populate(populateFields);
};

export const assignTicket = async (
  id, assignedTo, userRole, userId,
) => {
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (ticket.status === "archived") {
    throw new AppError("Archived tickets cannot be modified", 400);
  }

  const agent = await User.findById(assignedTo);
  if (!agent) {
    throw new AppError("Assignee not found", 404);
  }
  if (!["agent", "admin"].includes(agent.role)) {
    throw new AppError("Assignee must be an agent or admin", 400);
  }
  if (!agent.isActive) {
    throw new AppError("Assignee must be an active agent", 400);
  }

  ticket.assignedTo = assignedTo;
  await ticket.save();

  return ticket.populate(populateFields);
};

export const getTicketStats = async () => {
  const now = new Date();

  const statuses = [
    "open", "on_hold", "escalated", "closed", "archived",
  ];

  const counts = await Ticket.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  statuses.forEach((s) => {
    countMap[s] = 0;
  });
  counts.forEach((c) => {
    countMap[c._id] = c.count;
  });

  const unassigned = await Ticket.countDocuments({
    assignedTo: null,
    status: { $ne: "archived" },
  });

  const slaBreached = await Ticket.countDocuments({
    dueAt: { $lt: now },
    status: { $in: ["open", "on_hold", "escalated"] },
  });

  return {
    open: countMap.open,
    onHold: countMap.on_hold,
    escalated: countMap.escalated,
    closed: countMap.closed,
    archived: countMap.archived,
    unassigned,
    slaBreached,
  };
};
