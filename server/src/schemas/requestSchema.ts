import { z } from "zod";

/**
 * Schema for submitting a new skip trace request
 */
export const submitRequestSchema = z.object({
  body: z.object({
    rows: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === "string" ? parseInt(val, 10) : val
    ).refine(val => !isNaN(val) && val > 0, {
      message: "Rows must be a positive number"
    }),
    state: z.string().min(2, "State is required"),
    market: z.string().min(1, "Market is required"),
    county: z.string().optional().default("N/A"),
    zipCode: z.string().optional().default("N/A"),
    motivations: z.string().optional(),
    ownershipCriteriaFinale: z.array(z.any()).optional(),
    customNotes: z.string().optional(),
  })
});
