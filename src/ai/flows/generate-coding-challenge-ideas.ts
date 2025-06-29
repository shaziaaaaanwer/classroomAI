'use server';

/**
 * @fileOverview Generates a simple coding challenge idea based on a topic.
 *
 * - generateCodingChallengeIdea - A function that generates a coding challenge idea.
 * - GenerateCodingChallengeIdeaInput - The input type for the generateCodingChallengeIdea function.
 * - GenerateCodingChallengeIdeaOutput - The return type for the generateCodingChallengeIdea function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodingChallengeIdeaInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a coding challenge idea.'),
});
export type GenerateCodingChallengeIdeaInput = z.infer<typeof GenerateCodingChallengeIdeaInputSchema>;

const GenerateCodingChallengeIdeaOutputSchema = z.object({
  task: z.string().describe('A short description of a simple coding task related to the topic.'),
});
export type GenerateCodingChallengeIdeaOutput = z.infer<typeof GenerateCodingChallengeIdeaOutputSchema>;

export async function generateCodingChallengeIdea(input: GenerateCodingChallengeIdeaInput): Promise<GenerateCodingChallengeIdeaOutput> {
  return generateCodingChallengeIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodingChallengeIdeaPrompt',
  input: {schema: GenerateCodingChallengeIdeaInputSchema},
  output: {schema: GenerateCodingChallengeIdeaOutputSchema},
  prompt: `You are a helpful assistant that creates simple coding challenges.
Given the topic, generate a single, simple coding challenge idea that a beginner could try.

Provide only a short description of the task. Do not provide any starter code.

Topic: {{{topic}}}
`,
});

const generateCodingChallengeIdeaFlow = ai.defineFlow(
  {
    name: 'generateCodingChallengeIdeaFlow',
    inputSchema: GenerateCodingChallengeIdeaInputSchema,
    outputSchema: GenerateCodingChallengeIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
