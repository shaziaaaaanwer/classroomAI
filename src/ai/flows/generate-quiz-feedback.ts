'use server';

/**
 * @fileOverview Generates personalized feedback on a user's quiz performance.
 *
 * - generateQuizFeedback - A function that generates feedback.
 * - GenerateQuizFeedbackInput - The input type for the generateQuizFeedback function.
 * - GenerateQuizFeedbackOutput - The return type for the generateQuizFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserAnswerSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  isCorrect: z.boolean(),
});

const GenerateQuizFeedbackInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  questionsAndAnswers: z.array(UserAnswerSchema).describe("The user's performance on the quiz, including each question, their answer, the correct answer, and whether they were correct."),
});
export type GenerateQuizFeedbackInput = z.infer<typeof GenerateQuizFeedbackInputSchema>;

const GenerateQuizFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback on the user\'s quiz performance, formatted in Markdown.'),
});
export type GenerateQuizFeedbackOutput = z.infer<typeof GenerateQuizFeedbackOutputSchema>;

export async function generateQuizFeedback(input: GenerateQuizFeedbackInput): Promise<GenerateQuizFeedbackOutput> {
  return generateQuizFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFeedbackPrompt',
  input: {schema: GenerateQuizFeedbackInputSchema},
  output: {schema: GenerateQuizFeedbackOutputSchema},
  prompt: `You are an expert AI tutor. A student has just completed a quiz on the topic "{{{topic}}}".
Analyze their performance based on the questions they got right and wrong.

Provide detailed, constructive feedback. Your feedback should:
1.  Start with a positive and encouraging tone.
2.  Summarize their overall performance.
3.  Identify their strong areas based on the questions they answered correctly.
4.  Identify their weak areas based on the questions they answered incorrectly. For these, briefly explain the underlying concepts they might be struggling with.
5.  Suggest specific topics or concepts to review.
6.  End with an encouraging closing statement.

Format the entire feedback using Markdown. Use headings, lists, and bold text to make it easy to read.

Here is the student's performance data:
{{{json questionsAndAnswers}}}
`,
});

const generateQuizFeedbackFlow = ai.defineFlow(
  {
    name: 'generateQuizFeedbackFlow',
    inputSchema: GenerateQuizFeedbackInputSchema,
    outputSchema: GenerateQuizFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
