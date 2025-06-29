// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Implements code evaluation and feedback using Gemini API.
 *
 * - evaluateCode - Function to submit code and receive feedback.
 * - EvaluateCodeInput - Input type for evaluateCode.
 * - EvaluateCodeOutput - Output type for evaluateCode.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateCodeInputSchema = z.object({
  code: z.string().describe('The code submitted by the user.'),
  task: z.string().describe('The task or problem the code is intended to solve.'),
});
export type EvaluateCodeInput = z.infer<typeof EvaluateCodeInputSchema>;

const EvaluateCodeOutputSchema = z.object({
  feedback: z.string().describe('Feedback from the Gemini API on the code submission.'),
});
export type EvaluateCodeOutput = z.infer<typeof EvaluateCodeOutputSchema>;

export async function evaluateCode(input: EvaluateCodeInput): Promise<EvaluateCodeOutput> {
  return evaluateCodeFlow(input);
}

const evaluateCodePrompt = ai.definePrompt({
  name: 'evaluateCodePrompt',
  input: {schema: EvaluateCodeInputSchema},
  output: {schema: EvaluateCodeOutputSchema},
  prompt: `You are an expert coding tutor. You will provide feedback on code submissions based on the task the code is intended to solve.

Task: {{{task}}}
Code:
\`\`\`
{{{code}}}
\`\`\`

Provide constructive feedback to help the user improve their coding skills, including identifying errors, suggesting improvements, and explaining best practices.
Format your feedback using Markdown. Use headings, lists, bold text, and code blocks to make the feedback clear and readable.`,
});

const evaluateCodeFlow = ai.defineFlow(
  {
    name: 'evaluateCodeFlow',
    inputSchema: EvaluateCodeInputSchema,
    outputSchema: EvaluateCodeOutputSchema,
  },
  async input => {
    const {output} = await evaluateCodePrompt(input);
    return output!;
  }
);
