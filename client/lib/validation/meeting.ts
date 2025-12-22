import { z } from "zod";

export const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Meeting date is required"),
  scope: z.enum(["sprint", "phase"]),
  entityId: z.string().min(1, "Please select a sprint or phase"),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be under 10MB")
    .refine((file) => file.type === "application/pdf", "Only PDF files are allowed"),
});
