import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const getTicketMessagesSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const createTicketMessageSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    body: z
      .string()
      .trim()
      .min(1, "Message body cannot be empty")
      .max(5000, "Message body must not exceed 5000 chars"),
    isInternal: z.boolean().optional(),
  }),
});
