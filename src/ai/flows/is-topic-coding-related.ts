'use server';
/**
 * @fileOverview A flow to determine if a topic is coding-related.
 *
 * - isTopicCodingRelated - A function that checks if a topic is related to coding.
 * - IsTopicCodingRelatedInput - The input type for the isTopicCodingRelated function.
 * - IsTopicCodingRelatedOutput - The return type for the isTopicCodingRelated function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IsTopicCodingRelatedInputSchema = z.object({
  topic: z.string().describe('The course topic to be evaluated.'),
});
export type IsTopicCodingRelatedInput = z.infer<typeof IsTopicCodingRelatedInputSchema>;

const IsTopicCodingRelatedOutputSchema = z.object({
  isCodingTopic: z.boolean().describe('True if the topic is related to coding, programming, or software development.'),
});
export type IsTopicCodingRelatedOutput = z.infer<typeof IsTopicCodingRelatedOutputSchema>;

export async function isTopicCodingRelated(input: IsTopicCodingRelatedInput): Promise<IsTopicCodingRelatedOutput> {
  return isTopicCodingRelatedFlow(input);
}

const prompt = ai.definePrompt({
  name: 'isTopicCodingRelatedPrompt',
  input: {schema: IsTopicCodingRelatedInputSchema},
  output: {schema: IsTopicCodingRelatedOutputSchema},
  prompt: `You are an expert in curriculum design and subject matter classification. Your task is to determine if a given topic is related to computer programming, software development, data science, or any coding-related field.

Topic: {{{topic}}}

Respond with a boolean value indicating if the topic is coding-related.`,
});

const isTopicCodingRelatedFlow = ai.defineFlow(
  {
    name: 'isTopicCodingRelatedFlow',
    inputSchema: IsTopicCodingRelatedInputSchema,
    outputSchema: IsTopicCodingRelatedOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
