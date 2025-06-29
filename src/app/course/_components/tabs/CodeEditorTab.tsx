"use client";

import { useState, useEffect } from "react";
import { evaluateCode } from "@/ai/flows/evaluate-code-submissions";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import { useCourse } from "@/contexts/CourseContext";
import { generateCodingChallengeIdea } from "@/ai/flows/generate-coding-challenge-ideas";

export function CodeEditorTab() {
  const [code, setCode] = useState("");
  const [task, setTask] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { topic } = useCourse();
  const [placeholders, setPlaceholders] = useState({
    task: "e.g., 'A function to find the max element in an array'",
  });
  const [isPlaceholderLoading, setIsPlaceholderLoading] = useState(true);

  useEffect(() => {
    const fetchChallengeIdea = async () => {
      if (topic) {
        setIsPlaceholderLoading(true);
        try {
          const idea = await generateCodingChallengeIdea({ topic });
          setPlaceholders(idea);
        } catch (error) {
          console.error("Failed to generate coding challenge idea:", error);
          // Silently fail and use default placeholders
        } finally {
          setIsPlaceholderLoading(false);
        }
      } else {
        setIsPlaceholderLoading(false);
      }
    };

    fetchChallengeIdea();
  }, [topic]);

  const handleEvaluateCode = async () => {
    if (!code || !task) {
      toast({ variant: "destructive", title: "Error", description: "Please provide both code and a task description." });
      return;
    }
    setIsLoading(true);
    setFeedback("");
    try {
      const result = await evaluateCode({ code, task });
      setFeedback(result.feedback);
    } catch (error) {
      console.error("Failed to evaluate code:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not evaluate code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Code Submission</CardTitle>
          <CardDescription>Write your code and describe the task it should solve. Then, get feedback from the AI.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">Task Description</Label>
            <Input
              id="task"
              placeholder={isPlaceholderLoading ? 'Generating a suggestion...' : placeholders.task}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              disabled={isPlaceholderLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Your Code</Label>
            <Textarea
              id="code"
              placeholder="Enter your code here..."
              className="font-mono min-h-[300px]"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPlaceholderLoading}
            />
          </div>
          <Button onClick={handleEvaluateCode} disabled={isLoading || isPlaceholderLoading}>
            {isLoading ? "Evaluating..." : "Get Feedback"}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Feedback</CardTitle>
          <CardDescription>Here's what the AI tutor thinks of your code.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader text="Analyzing your code..." />}
          {feedback && (
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-md">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          )}
          {!isLoading && !feedback && (
            <div className="text-center text-muted-foreground py-10">
              Your feedback will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
