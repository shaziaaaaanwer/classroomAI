// src/ai/flows/generate-mcq-quiz.ts
'use server';

/**
 * @fileOverview Generates a multiple-choice quiz for a given topic.
 *
 * - generateMCQQuiz - A function that generates a multiple-choice quiz.
 * - GenerateMCQQuizInput - The input type for the generateMCQQuiz function.
 * - GenerateMCQQuizOutput - The return type for the generateMCQQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMCQQuizInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate the quiz.'),
  difficultyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of the quiz.'),
});
export type GenerateMCQQuizInput = z.infer<typeof GenerateMCQQuizInputSchema>;

const GenerateMCQQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The multiple-choice question.'),
      options: z.array(z.string()).describe('The options for the question.'),
      answer: z.string().describe('The correct answer to the question.'),
      explanation: z.string().describe('Explanation of the correct answer.'),
    })
  ).describe('An array of multiple-choice questions with options, answers, and explanations.'),
});

export type GenerateMCQQuizOutput = z.infer<typeof GenerateMCQQuizOutputSchema>;

export async function generateMCQQuiz(input: GenerateMCQQuizInput): Promise<GenerateMCQQuizOutput> {
  return generateMCQQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMCQQuizPrompt',
  input: {schema: GenerateMCQQuizInputSchema},
  output: {schema: GenerateMCQQuizOutputSchema},
  prompt: `You are an expert quiz generator. Generate a 10-question multiple-choice quiz for the following topic at a {{{difficultyLevel}}} level. Each question should have 4 options, one correct answer, and a detailed explanation for the answer.

Topic: {{{topic}}}

Output a JSON array of questions. Each question object should have the following keys: question, options, answer, explanation. The options field should be a JSON array of strings.

Here is an example:

[{
  "question": "What is the capital of France?",
  "options": ["Berlin", "Paris", "Madrid", "Rome"],
  "answer": "Paris",
  "explanation": "Paris is the capital and most populous city of France."
}]

Ensure the output is valid JSON and can be parsed without errors. Do not include any intro or outro text.`,
});

const generateMCQQuizFlow = ai.defineFlow(
  {
    name: 'generateMCQQuizFlow',
    inputSchema: GenerateMCQQuizInputSchema,
    outputSchema: GenerateMCQQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
