import { TicketMessage } from "../models/TicketMessage.js";
import { Ticket } from "../models/Ticket.js";
import { AppError } from "../utils/AppError.js";

const senderFields = { name: 1, email: 1, role: 1 };

export const getTicketMessages = async (ticketId, userRole, userId) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (
    userRole === "customer" &&
    ticket.requester.toString() !== userId.toString()
  ) {
    throw new AppError("You can only view messages on your own tickets", 403);
  }

  const filter = { ticket: ticketId };

  if (userRole === "customer") {
    filter.isInternal = false;
  }

  return TicketMessage.find(filter)
    .populate("sender", senderFields)
    .sort({ createdAt: 1 });
};

export const createTicketMessage = async (
  ticketId, body, isInternal, senderId, senderRole,
) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (ticket.status === "archived") {
    throw new AppError("Archived tickets reject new messages", 400);
  }

  if (
    senderRole === "customer" &&
    ticket.requester.toString() !== senderId.toString()
  ) {
    throw new AppError(
      "Customers can only message their own tickets",
      403,
    );
  }

  let messageIsInternal = isInternal === true;

  if (senderRole === "customer") {
    messageIsInternal = false;
  }

  const message = await TicketMessage.create({
    ticket: ticketId,
    sender: senderId,
    body,
    isInternal: messageIsInternal,
  });

  return message.populate("sender", senderFields);
};
