import { z } from "zod";

export const quizSubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
  timeTaken: z.number().min(0),
});

export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>;
