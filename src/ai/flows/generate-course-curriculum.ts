'use server';
/**
 * @fileOverview Generates a structured course curriculum based on a given topic.
 *
 * - generateCourseCurriculum - A function that generates the course curriculum.
 * - GenerateCourseCurriculumInput - The input type for the generateCourseCurriculum function.
 * - GenerateCourseCurriculumOutput - The return type for the generateCourseCurriculum function.
 * - Lesson - The type for a lesson.
 * - Module - The type for a module.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LessonSchema = z.object({
  title: z.string().describe('The title of the lesson.'),
});
export type Lesson = z.infer<typeof LessonSchema>;

const ModuleSchema = z.object({
  title: z.string().describe('The title of the module.'),
  lessons: z.array(LessonSchema).describe('A list of lessons within the module.'),
});
export type Module = z.infer<typeof ModuleSchema>;

const GenerateCourseCurriculumInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate the course curriculum.'),
});
export type GenerateCourseCurriculumInput = z.infer<typeof GenerateCourseCurriculumInputSchema>;

const GenerateCourseCurriculumOutputSchema = z.object({
  beginner: z.array(ModuleSchema).describe('A list of modules for the beginner level.'),
  intermediate: z.array(ModuleSchema).describe('A list of modules for the intermediate level.'),
  advanced: z.array(ModuleSchema).describe('A list of modules for the advanced level.'),
});
export type GenerateCourseCurriculumOutput = z.infer<typeof GenerateCourseCurriculumOutputSchema>;

export async function generateCourseCurriculum(input: GenerateCourseCurriculumInput): Promise<GenerateCourseCurriculumOutput> {
  return generateCourseCurriculumFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCourseCurriculumPrompt',
  input: {schema: GenerateCourseCurriculumInputSchema},
  output: {schema: GenerateCourseCurriculumOutputSchema},
  prompt: `You are an expert curriculum designer. Please generate a structured course curriculum for the following topic.
The curriculum should be broken down into three sections: beginner, intermediate, and advanced.
Each section should contain a list of modules, and each module should contain a list of lessons.

Topic: {{{topic}}}`,
});

const generateCourseCurriculumFlow = ai.defineFlow(
  {
    name: 'generateCourseCurriculumFlow',
    inputSchema: GenerateCourseCurriculumInputSchema,
    outputSchema: GenerateCourseCurriculumOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
