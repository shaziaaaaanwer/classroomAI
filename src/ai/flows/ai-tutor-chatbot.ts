// src/ai/flows/ai-tutor-chatbot.ts
'use server';
/**
 * @fileOverview An AI tutor chatbot flow that allows users to ask follow-up questions and receive personalized help.
 *
 * - aiTutorChatbot - A function that handles the chatbot interaction.
 * - AITutorChatbotInput - The input type for the aiTutorChatbot function.
 * - AITutorChatbotOutput - The return type for the aiTutorChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AITutorChatbotInputSchema = z.object({
  question: z.string().describe('The user question to the AI tutor.'),
  context: z.string().optional().describe('The context for the question (e.g., previous lesson content).'),
});
export type AITutorChatbotInput = z.infer<typeof AITutorChatbotInputSchema>;

const AITutorChatbotOutputSchema = z.object({
  answer: z.string().describe('The AI tutor answer to the question.'),
});
export type AITutorChatbotOutput = z.infer<typeof AITutorChatbotOutputSchema>;

export async function aiTutorChatbot(input: AITutorChatbotInput): Promise<AITutorChatbotOutput> {
  return aiTutorChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorChatbotPrompt',
  input: {schema: AITutorChatbotInputSchema},
  output: {schema: AITutorChatbotOutputSchema},
  prompt: `You are an AI tutor specializing in answering student questions.
Format your answer using Markdown. Use things like lists, bold text, and code blocks to make your explanations clear.

Context: {{{context}}}

Question: {{{question}}}

Answer:`,
});

const aiTutorChatbotFlow = ai.defineFlow(
  {
    name: 'aiTutorChatbotFlow',
    inputSchema: AITutorChatbotInputSchema,
    outputSchema: AITutorChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
