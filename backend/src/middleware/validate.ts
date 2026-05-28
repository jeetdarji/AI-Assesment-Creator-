import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const assignmentSchema = z.object({
  assignmentName: z.string().trim().min(1).max(120),
  questionTypes: z
    .array(
      z.object({
        type: z.string().trim().min(1).max(80),
        count: z.number().int().min(1).max(100),
        marks: z.number().int().min(1).max(100),
      })
    )
    .min(1)
    .max(20),
  dueDate: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid due date")
    .optional(),
  additionalInfo: z.string().trim().max(1000).optional(),
});

export function validateAssignment(req: Request, res: Response, next: NextFunction): void {
  try {
    let questionTypes = req.body.questionTypes;
    if (typeof questionTypes === "string") {
      questionTypes = JSON.parse(questionTypes);
    }

    const parsed = assignmentSchema.parse({
      assignmentName: req.body.assignmentName,
      questionTypes,
      dueDate: req.body.dueDate || undefined,
      additionalInfo: req.body.additionalInfo || undefined,
    });

    req.body.assignmentName = parsed.assignmentName;
    req.body.questionTypes = parsed.questionTypes;
    req.body.dueDate = parsed.dueDate;
    req.body.additionalInfo = parsed.additionalInfo;

    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
      res.status(400).json({ error: "Validation failed", details: messages });
      return;
    }
    res.status(400).json({ error: "Invalid request body" });
  }
}
