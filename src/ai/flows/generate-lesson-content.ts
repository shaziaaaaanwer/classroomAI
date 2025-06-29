'use server';

/**
 * @fileOverview A lesson content generation AI agent.
 *
 * - generateLessonContent - A function that handles the lesson content generation process.
 * - GenerateLessonContentInput - The input type for the generateLessonContent function.
 * - GenerateLessonContentOutput - The return type for the generateLessonContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonContentInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate lesson content.'),
  difficultyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of the lesson content.'),
});
export type GenerateLessonContentInput = z.infer<typeof GenerateLessonContentInputSchema>;

const GenerateLessonContentOutputSchema = z.object({
  lessonContent: z.string().describe('The generated lesson content for the specified topic and difficulty level.'),
});
export type GenerateLessonContentOutput = z.infer<typeof GenerateLessonContentOutputSchema>;

export async function generateLessonContent(input: GenerateLessonContentInput): Promise<GenerateLessonContentOutput> {
  return generateLessonContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  input: {schema: GenerateLessonContentInputSchema},
  output: {schema: GenerateLessonContentOutputSchema},
  prompt: `You are an expert educator specializing in creating lesson content for various topics and difficulty levels.

You will use the topic and difficulty level to generate comprehensive and engaging lesson content. The content should be well-structured and easy to read.

Format the output using Markdown. Use headings (#, ##, ###), bold text (**text**), italics (*text*), and lists (- item) to structure the content. Do not use blockquotes.

Topic: {{{topic}}}
Difficulty Level: {{{difficultyLevel}}}

Lesson Content:`,
});

const generateLessonContentFlow = ai.defineFlow(
  {
    name: 'generateLessonContentFlow',
    inputSchema: GenerateLessonContentInputSchema,
    outputSchema: GenerateLessonContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
