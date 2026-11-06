import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Category must be at least 3 characters")
      .max(60, "Category must not exceed 60 characters"),

    code: z
      .string()
      .trim()
      .min(2, "Category code must be at least 2 characters")
      .max(10, "Category code must not exceed 10 characters"),

    description: z.string().trim().optional().default(""),
    subcategories: z
      .array(
        z.string().trim().min(2, "Subcategory must be at least 2 characters"),
      )
      .min(1, "At least one subcategory is required"),
    defaultPriority: z
      .enum(["low", "medium", "high", "critical"])
      .optional()
      .default("medium"),
    slaHours: z
      .number({ invalid_type_error: "SLA hours must be a number" })
      .int("SLA must be an integer")
      .min(1, "SLA must be at least 1 hour"),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID format"),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Category name must be at least 3 characters")
      .max(60, "Category name must not exceed 60 characters")
      .optional(),
    description: z.string().trim().optional(),
    subcategories: z
      .array(
        z.string().trim().min(2, "Subcategory must be at least 2 characters"),
      )
      .min(1, "Subcategory array cannot be empty")
      .optional(),
    defaultPriority: z.enum(["low", "medium", "high", "critical"]).optional(),
    slaHours: z
      .number({ invalid_type_error: "SLA hours must be a number" })
      .int("SLA hours must be an integer")
      .min(1, "SLA must be at least 1 hour")
      .optional(),
    isActive: z.boolean().optional(),
  }),
});
