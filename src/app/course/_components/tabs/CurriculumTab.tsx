"use client";

import { useEffect, useState } from "react";
import { useCourse } from "@/contexts/CourseContext";
import { generateCourseCurriculum } from "@/ai/flows/generate-course-curriculum";
import { generateLessonContent } from "@/ai/flows/generate-lesson-content";
import type { Lesson, Module } from "@/ai/flows/generate-course-curriculum";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, BookOpen } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export function CurriculumTab() {
  const { topic, curriculum, setCurriculum, lessons, setLessonContent } = useCourse();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!curriculum && topic) {
      const fetchCurriculum = async () => {
        setIsLoading(true);
        try {
          const result = await generateCourseCurriculum({ topic });
          setCurriculum(result);
        } catch (error) {
          console.error("Failed to generate curriculum:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not generate course curriculum. Please try again.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchCurriculum();
    }
  }, [topic, curriculum, setCurriculum, toast]);

  const fetchLesson = async (lesson: Lesson, moduleIndex: number, totalModules: number) => {
    if (lessons[lesson.title]?.content || lessons[lesson.title]?.isLoading) return;

    setLessonContent(lesson.title, '', true);
    try {
      // Determine difficulty based on module progression
      let difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
      if (totalModules > 1) {
        const progress = moduleIndex / (totalModules - 1);
        if (progress > 0.66) {
          difficultyLevel = 'Advanced';
        } else if (progress > 0.33) {
          difficultyLevel = 'Intermediate';
        }
      }
      
      const result = await generateLessonContent({ topic: lesson.title, difficultyLevel });
      setLessonContent(lesson.title, result.lessonContent, false);
    } catch (error) {
      console.error("Failed to generate lesson content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not generate content for lesson: ${lesson.title}`,
      });
      setLessonContent(lesson.title, 'Failed to load content.', false);
    }
  };

  const renderModuleSection = (title: string, modules: Module[], overallModuleIndexOffset: number, totalModules: number) => {
    if (!modules || modules.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-semibold font-headline tracking-tight mb-4 border-b pb-2">{title}</h3>
        <Accordion type="single" collapsible className="w-full">
          {modules.map((module, moduleIndex) => (
            <AccordionItem value={`${title}-item-${moduleIndex}`} key={moduleIndex}>
              <AccordionTrigger className="text-lg font-medium hover:no-underline">
                {module.title}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-4">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <li key={lessonIndex}>
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`lesson-${lessonIndex}`}>
                          <AccordionTrigger
                            className="text-base py-3"
                            onClick={() => fetchLesson(lesson, overallModuleIndexOffset + moduleIndex, totalModules)}
                          >
                            <div className="flex items-center gap-3">
                              {lessons[lesson.title]?.content ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                              )}
                              <span>{lesson.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="prose prose-sm dark:prose-invert max-w-none p-4 border-l-2 ml-4">
                            {lessons[lesson.title]?.isLoading ? (
                              <Loader text="Generating lesson..." />
                            ) : (
                              <ReactMarkdown>{lessons[lesson.title]?.content || ''}</ReactMarkdown>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };

  if (isLoading) {
    return <Loader text="Generating your personalized curriculum..." />;
  }

  const totalModules = curriculum ? curriculum.beginner.length + curriculum.intermediate.length + curriculum.advanced.length : 0;
  const hasContent = totalModules > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Curriculum</CardTitle>
        <CardDescription>Here is the structured curriculum for your course on "{topic}".</CardDescription>
      </CardHeader>
      <CardContent>
        {hasContent && curriculum ? (
            <>
              {renderModuleSection('Beginner', curriculum.beginner, 0, totalModules)}
              {renderModuleSection('Intermediate', curriculum.intermediate, curriculum.beginner.length, totalModules)}
              {renderModuleSection('Advanced', curriculum.advanced, curriculum.beginner.length + curriculum.intermediate.length, totalModules)}
            </>
          ) : (
          !isLoading && <p>No curriculum generated yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
