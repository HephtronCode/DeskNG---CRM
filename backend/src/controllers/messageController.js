import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as messageService from "../services/messageService.js";

export const listMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getTicketMessages(
    req.params.id,
    req.user.role,
    req.user._id,
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: "Ticket messages retrieved successfully",
    data: messages,
  });
});

export const addMessage = asyncHandler(async (req, res) => {
  const message = await messageService.createTicketMessage(
    req.params.id,
    req.body.body,
    req.body.isInternal,
    req.user._id,
    req.user.role,
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "Message added successfully",
    data: message,
  });
});
