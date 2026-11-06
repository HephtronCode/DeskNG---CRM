import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

export const createTicketSchema = z.object({
  body: z.object({
    subject: z
      .string()
      .trim()
      .min(5, "Subject must be at least 5 characters")
      .max(120, "Subject must not exceed 120 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters"),
    type: z.enum([
      "incident",
      "service_request",
      "inquiry",
      "complaint",
    ]),
    category: objectId,
    subcategory: z
      .string()
      .trim()
      .min(2, "Subcategory is required"),
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .optional(),
  }),
});

export const listTicketsSchema = z.object({
  query: z.object({
    status: z.enum([
      "open", "on_hold", "escalated", "closed", "archived",
    ]).optional(),
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .optional(),
    type: z.enum([
      "incident",
      "service_request",
      "inquiry",
      "complaint",
    ]).optional(),
    category: objectId.optional(),
    assignedTo: objectId.optional(),
    search: z.string().trim().optional(),
    page: z
      .coerce
      .number()
      .int()
      .min(1)
      .optional()
      .default(1),
    limit: z
      .coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(10),
    includeArchived: z
      .string()
      .transform((val) => val === "true")
      .optional()
      .default("false"),
  }),
});

export const getTicketSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    status: z.enum([
      "open", "on_hold", "escalated", "closed", "archived",
    ]),
    escalationReason: z.string().trim().optional(),
  }),
});

export const assignTicketSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    assignedTo: objectId,
  }),
});
