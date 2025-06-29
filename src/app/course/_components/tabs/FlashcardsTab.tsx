"use client";

import { useState } from "react";
import { useCourse } from "@/contexts/CourseContext";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Flashcard = ({ question, answer }: { question: string, answer: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div
      className="w-full h-64 [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        <div className="absolute w-full h-full [backface-visibility:hidden] rounded-lg border bg-card flex items-center justify-center p-6">
          <p className="text-xl font-semibold">{question}</p>
        </div>
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border bg-primary text-primary-foreground flex items-center justify-center p-6">
          <p className="text-xl">{answer}</p>
        </div>
      </div>
    </div>
  );
};

export function FlashcardsTab() {
  const { topic, flashcards, setFlashcards } = useCourse();
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const { toast } = useToast();

  const handleGenerateFlashcards = async () => {
    if (!topic) {
      toast({ variant: "destructive", title: "Error", description: "Course topic is not available." });
      return;
    }
    
    setIsLoading(true);
    setFlashcards(null); // Clear previous flashcards
    try {
      const result = await generateFlashcards({ topic, difficultyLevel: difficulty });
      setFlashcards(result.flashcards);
      if (result.flashcards.length === 0) {
        toast({ title: "No flashcards generated", description: "The AI couldn't generate flashcards for this topic. Try being more specific." });
      }
    } catch (error)
{
      console.error("Failed to generate flashcards:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not generate flashcards. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flashcards</CardTitle>
        <CardDescription>Generate flashcards for your course on "{topic}" to review key concepts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="space-y-2 w-full sm:w-auto">
            <Label htmlFor="flashcard-difficulty">Select Difficulty</Label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as any)}>
              <SelectTrigger id="flashcard-difficulty" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerateFlashcards} disabled={isLoading} className="w-full sm:w-auto">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Generating..." : "Generate Flashcards"}
          </Button>
        </div>
        
        {isLoading && <Loader text="Generating your flashcards..." />}
        
        {!isLoading && flashcards && flashcards.length > 0 && (
          <div className="pt-4">
            <Carousel className="w-full max-w-xl mx-auto">
              <CarouselContent>
                {flashcards.map((card, index) => (
                  <CarouselItem key={index}>
                    <Flashcard question={card.question} answer={card.answer} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
             <div className="text-center mt-2 text-sm text-muted-foreground">
                {flashcards.length} cards generated. Click a card to flip.
            </div>
          </div>
        )}
        
        {!isLoading && (!flashcards || flashcards.length === 0) && (
            <div className="text-center text-muted-foreground py-10">
              <p>
                {flashcards === null ? "Click the button to generate flashcards." : "No flashcards were generated. Try generating again."}
              </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
