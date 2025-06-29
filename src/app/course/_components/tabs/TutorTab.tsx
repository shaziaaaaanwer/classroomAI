"use client";

import { useState, useRef, useEffect } from "react";
import { useCourse } from "@/contexts/CourseContext";
import { aiTutorChatbot } from "@/ai/flows/ai-tutor-chatbot";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, User, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export function TutorTab() {
  const { topic, curriculum, lessons } = useCourse();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextLesson, setContextLesson] = useState<string>("general");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const allModules = curriculum ? [...curriculum.beginner, ...curriculum.intermediate, ...curriculum.advanced] : [];
  const generatedLessons = allModules.flatMap(m => m.lessons).filter(l => lessons[l.title]?.content) || [];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const useLessonContext = contextLesson && contextLesson !== "general";
      const context = useLessonContext
        ? `Lesson: ${contextLesson}\n\nContent:\n${lessons[contextLesson].content}`
        : `Course Topic: ${topic}`;
      const result = await aiTutorChatbot({ question: input, context });
      const botMessage: Message = { role: 'bot', content: result.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to get tutor response:", error);
      toast({ variant: "destructive", title: "Error", description: "The AI tutor is unavailable right now. Please try again." });
      setMessages(prev => prev.slice(0, prev.length -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[70vh] flex flex-col">
      <CardHeader>
        <CardTitle>AI Tutor</CardTitle>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <CardDescription>Ask follow-up questions about {topic}.</CardDescription>
            <Select onValueChange={setContextLesson} value={contextLesson}>
                <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Set Conversation Context" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="general">General ({topic})</SelectItem>
                    {generatedLessons.map(l => (
                        <SelectItem key={l.title} value={l.title}>{l.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'bot' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback><Bot size={18} /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg p-3 max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.role === 'user' ? (
                    <p className="text-sm">{message.content}</p>
                  ) : (
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-0">
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback><User size={18} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-4">
                     <Avatar className="w-8 h-8 border">
                        <AvatarFallback><Bot size={18} /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-foreground rounded-full animate-bounce"></span>
                        </div>
                    </div>
                 </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
