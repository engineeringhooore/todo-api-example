import { z } from "zod";

export const createTodoSchema = z.object({
  note: z.string(),
});

export type CreateTodoSchema = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = z.object({
  note: z.string(),
  attachment: z.string(),
});

export type UpdateTodoSchema = z.infer<typeof updateTodoSchema>;
