import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as ticketService from "../services/ticketService.js";

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.createTicket(req.body, req.user._id);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Ticket created successfully",
    data: ticket,
  });
});

export const listTickets = asyncHandler(async (req, res) => {
  const { tickets, meta } = await ticketService.getTickets(
    req.query,
    req.user.role,
    req.user._id,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Tickets retrieved successfully",
    data: tickets,
    meta,
  });
});

export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicketById(
    req.params.id,
    req.user.role,
    req.user._id,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Ticket retrieved successfully",
    data: ticket,
  });
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await ticketService.updateTicketStatus(
    req.params.id,
    req.body.status,
    req.user.role,
    req.user._id,
    req.body.escalationReason,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Ticket status updated successfully",
    data: ticket,
  });
});

export const assignTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.assignTicket(
    req.params.id,
    req.body.assignedTo,
    req.user.role,
    req.user._id,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Ticket assigned successfully",
    data: ticket,
  });
});

export const getTicketStats = asyncHandler(async (req, res) => {
  const stats = await ticketService.getTicketStats();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Ticket statistics retrieved successfully",
    data: stats,
  });
});
