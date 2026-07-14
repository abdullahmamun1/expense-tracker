import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

export const reportsQuerySchema = z
  .object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
  })
  .refine((data) => (data.from == null) === (data.to == null), {
    message: "Provide both 'from' and 'to', or neither",
  });
