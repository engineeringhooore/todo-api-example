import { z } from "zod";

export const verifySchema = z.object({
  key: z.string(),
});

export type VerifySchema = z.infer<typeof verifySchema>;
