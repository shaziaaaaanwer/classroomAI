"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { GenerateCourseCurriculumOutput } from '@/ai/flows/generate-course-curriculum';
import type { GenerateMCQQuizOutput } from '@/ai/flows/generate-mcq-quiz';
import type { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';

interface LessonContent {
  content: string;
  isLoading: boolean;
}

interface CourseContextType {
  topic: string;
  curriculum: GenerateCourseCurriculumOutput | null;
  setCurriculum: (curriculum: GenerateCourseCurriculumOutput | null) => void;
  lessons: Record<string, LessonContent>;
  setLessonContent: (lessonTitle: string, content: string, isLoading: boolean) => void;
  quiz: GenerateMCQQuizOutput['quiz'] | null;
  setQuiz: (quiz: GenerateMCQQuizOutput['quiz'] | null) => void;
  flashcards: GenerateFlashcardsOutput['flashcards'] | null;
  setFlashcards: (flashcards: GenerateFlashcardsOutput['flashcards'] | null) => void;
}

const CourseContext = createContext<CourseContextType | null>(null);

export function CourseProvider({ children, topic }: { children: ReactNode; topic: string }) {
  const [curriculum, setCurriculum] = useState<GenerateCourseCurriculumOutput | null>(null);
  const [lessons, setLessons] = useState<Record<string, LessonContent>>({});
  const [quiz, setQuiz] = useState<GenerateMCQQuizOutput['quiz'] | null>(null);
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);

  const setLessonContent = (lessonTitle: string, content: string, isLoading: boolean) => {
    setLessons(prev => ({ ...prev, [lessonTitle]: { content, isLoading } }));
  };
  
  const value = {
    topic,
    curriculum,
    setCurriculum,
    lessons,
    setLessonContent,
    quiz,
    setQuiz,
    flashcards,
    setFlashcards
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}
