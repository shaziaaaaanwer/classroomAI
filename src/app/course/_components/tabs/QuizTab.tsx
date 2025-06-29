"use client";

import { useState, useEffect } from "react";
import { useCourse } from "@/contexts/CourseContext";
import { generateMCQQuiz } from "@/ai/flows/generate-mcq-quiz";
import { generateQuizFeedback } from "@/ai/flows/generate-quiz-feedback";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, X, ChevronsRight, RotateCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export function QuizTab() {
  const { topic, quiz, setQuiz } = useCourse();
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const { toast } = useToast();
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  useEffect(() => {
    if (quizFinished && userAnswers.length === quiz?.length && quiz.length > 0) {
      const fetchFeedback = async () => {
        setIsFeedbackLoading(true);
        setFeedbackSummary(null);
        try {
          const result = await generateQuizFeedback({
            topic,
            questionsAndAnswers: userAnswers,
          });
          setFeedbackSummary(result.feedback);
        } catch (error) {
          console.error("Failed to generate quiz feedback:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not generate performance feedback.",
          });
        } finally {
          setIsFeedbackLoading(false);
        }
      };
      fetchFeedback();
    }
  }, [quizFinished, userAnswers, quiz, topic, toast]);

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFeedback(null);
    setSelectedOption(null);
    setUserAnswers([]);
    setFeedbackSummary(null);
    setQuiz(null);
    try {
      const result = await generateMCQQuiz({ topic, difficultyLevel: difficulty });
      setQuiz(result.quiz);
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not generate quiz. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || !quiz) return;
    const currentQuestion = quiz[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.answer;
    if (isCorrect) {
      setScore(s => s + 1);
    }
    setUserAnswers(prev => [...prev, {
      question: currentQuestion.question,
      userAnswer: selectedOption,
      correctAnswer: currentQuestion.answer,
      isCorrect,
    }]);
    setFeedback({ correct: isCorrect, explanation: currentQuestion.explanation });
  };

  const handleNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      setQuizFinished(true);
    }
  };
  
  if (isLoading) return <Loader text="Generating quiz..." />;

  if (!quiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Your Knowledge</CardTitle>
          <CardDescription>Generate a quiz to test your understanding of {topic}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-2 w-full sm:w-auto">
              <Label htmlFor="quiz-difficulty">Select Difficulty</Label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as any)}>
                <SelectTrigger id="quiz-difficulty" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateQuiz} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Generating..." : "Generate Quiz"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quiz[currentQuestionIndex];

  if (quizFinished) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
          <CardDescription>You scored {score} out of {quiz.length}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="space-y-2 w-full sm:w-auto">
              <Label htmlFor="quiz-difficulty-finished">Select Difficulty</Label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as any)}>
                  <SelectTrigger id="quiz-difficulty-finished" className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateQuiz}>
              <RotateCw className="mr-2 h-4 w-4" />
              Take Another Quiz
            </Button>
          </div>

          {isFeedbackLoading && <Loader text="Generating your performance feedback..." />}
          
          {feedbackSummary && (
            <Card className="mt-4 bg-muted/50">
              <CardHeader>
                <CardTitle className="text-xl">Performance Feedback</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{feedbackSummary}</ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz: {topic}</CardTitle>
        <CardDescription>Question {currentQuestionIndex + 1} of {quiz.length}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="font-semibold text-lg">{currentQuestion.question}</p>
        <RadioGroup
          value={selectedOption || ""}
          onValueChange={setSelectedOption}
          disabled={!!feedback}
        >
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
        
        {feedback && (
          <Alert variant={feedback.correct ? "default" : "destructive"} className={feedback.correct ? "bg-green-100 dark:bg-green-900 border-green-500" : ""}>
            {feedback.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <AlertTitle>{feedback.correct ? "Correct!" : "Incorrect"}</AlertTitle>
            <AlertDescription>{feedback.explanation}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          {feedback ? (
            <Button onClick={handleNextQuestion}>
              Next Question <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleCheckAnswer} disabled={!selectedOption}>Check Answer</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
