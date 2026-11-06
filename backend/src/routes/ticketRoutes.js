import { Router } from "express";
import {
  createTicket,
  listTickets,
  getTicket,
  updateTicketStatus,
  assignTicket,
  getTicketStats,
} from "../controllers/ticketController.js";
import {
  listMessages,
  addMessage,
} from "../controllers/messageController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createTicketSchema,
  listTicketsSchema,
  getTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
} from "../validators/ticketValidators.js";
import {
  getTicketMessagesSchema,
  createTicketMessageSchema,
} from "../validators/messageValidators.js";

const router = Router();

// All ticket routes require an authenticated session
router.use(protect);

router.post(
  "/",
  validate(createTicketSchema),
  createTicket,
);

router.get(
  "/",
  validate(listTicketsSchema),
  listTickets,
);

// /stats must precede /:id so "stats" is not matched as an ID
router.get(
  "/stats",
  authorize("agent", "admin"),
  getTicketStats,
);

router.get("/:id", validate(getTicketSchema), getTicket);

// Conversation thread under a ticket
router.get(
  "/:id/messages",
  validate(getTicketMessagesSchema),
  listMessages,
);

router.post(
  "/:id/messages",
  validate(createTicketMessageSchema),
  addMessage,
);

router.patch(
  "/:id/status",
  validate(updateTicketStatusSchema),
  updateTicketStatus,
);

router.patch(
  "/:id/assign",
  authorize("agent", "admin"),
  validate(assignTicketSchema),
  assignTicket,
);

export default router;
