import { config } from 'dotenv';
config();

import '@/ai/flows/generate-course-curriculum.ts';
import '@/ai/flows/ai-tutor-chatbot.ts';
import '@/ai/flows/generate-mcq-quiz.ts';
import '@/ai/flows/generate-lesson-content.ts';
import '@/ai/flows/generate-flashcards.ts';
import '@/ai/flows/evaluate-code-submissions.ts';
import '@/ai/flows/is-topic-coding-related.ts';
import '@/ai/flows/generate-coding-challenge-ideas.ts';
import '@/ai/flows/generate-quiz-feedback.ts';
