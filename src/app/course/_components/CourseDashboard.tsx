"use client";

import { useCourse } from "@/contexts/CourseContext";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurriculumTab } from "./tabs/CurriculumTab";
import { QuizTab } from "./tabs/QuizTab";
import { FlashcardsTab } from "./tabs/FlashcardsTab";
import { CodeEditorTab } from "./tabs/CodeEditorTab";
import { TutorTab } from "./tabs/TutorTab";
import { BookCopy, MessageCircle, Code, LayoutList, Puzzle } from "lucide-react";
import { useEffect, useState } from "react";
import { isTopicCodingRelated } from "@/ai/flows/is-topic-coding-related";
import { useToast } from "@/hooks/use-toast";

export function CourseDashboard() {
  const { topic } = useCourse();
  const { toast } = useToast();
  const [isCodingTopic, setIsCodingTopic] = useState<boolean | null>(null);

  useEffect(() => {
    if (topic) {
      setIsCodingTopic(null); // Reset on topic change
      const checkTopic = async () => {
        try {
          const result = await isTopicCodingRelated({ topic });
          setIsCodingTopic(result.isCodingTopic);
        } catch (error) {
          console.error("Failed to check if topic is coding related:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not determine topic type. The code editor may not be available.",
          });
          setIsCodingTopic(false);
        }
      };
      checkTopic();
    }
  }, [topic, toast]);

  const tabsListClass =
    isCodingTopic === false
      ? "grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-4"
      : "grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold font-headline tracking-tight">Course: {topic}</h1>
          <p className="mt-2 text-muted-foreground">
            Your personalized learning journey starts here. Explore the curriculum, take quizzes, and chat with your AI tutor.
          </p>

          <Tabs defaultValue="curriculum" className="mt-6">
            <TabsList className={tabsListClass}>
              <TabsTrigger value="curriculum"><LayoutList className="mr-2 h-4 w-4" />Curriculum</TabsTrigger>
              <TabsTrigger value="quiz"><Puzzle className="mr-2 h-4 w-4" />Quiz</TabsTrigger>
              <TabsTrigger value="flashcards"><BookCopy className="mr-2 h-4 w-4" />Flashcards</TabsTrigger>
              {isCodingTopic && <TabsTrigger value="code-editor"><Code className="mr-2 h-4 w-4" />Code Editor</TabsTrigger>}
              <TabsTrigger value="tutor"><MessageCircle className="mr-2 h-4 w-4" />AI Tutor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="mt-4">
              <CurriculumTab />
            </TabsContent>
            <TabsContent value="quiz" className="mt-4">
                <QuizTab />
            </TabsContent>
            <TabsContent value="flashcards" className="mt-4">
                <FlashcardsTab />
            </TabsContent>
            {isCodingTopic && (
              <TabsContent value="code-editor" className="mt-4">
                  <CodeEditorTab />
              </TabsContent>
            )}
            <TabsContent value="tutor" className="mt-4">
                <TutorTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
