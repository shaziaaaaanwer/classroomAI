// src/ai/flows/generate-flashcards.ts
'use server';

/**
 * @fileOverview Flashcard generation flow for lesson review.
 *
 * - generateFlashcards - A function that generates flashcards for a given topic.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The output type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic for which flashcards should be generated.'),
  difficultyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of the flashcards.'),
});

export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z
    .array(z.object({question: z.string(), answer: z.string()}))
    .describe('An array of flashcards, each with a question and an answer.'),
});

export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert educator. Generate a set of flashcards for the following topic at a {{{difficultyLevel}}} level.

Topic:
{{{topic}}}

Each flashcard should have a question and an answer. Focus on key concepts and definitions.

Return the flashcards as a JSON array of objects, where each object has a "question" and an "answer" field.
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
