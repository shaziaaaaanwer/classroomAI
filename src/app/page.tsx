"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck } from "lucide-react";

const formSchema = z.object({
  topic: z.string().min(3, {
    message: "Topic must be at least 3 characters.",
  }),
});

export default function Home() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push(`/course?topic=${encodeURIComponent(values.topic)}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="p-3 border-2 border-primary/20 bg-primary/10 rounded-full mb-4">
          <BookOpenCheck className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-5xl font-bold font-headline tracking-tight">ClassroomAI</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your personal AI-powered mentor. Input any topic and get a complete course, from curriculum to quizzes, all generated for you.
        </p>
      </div>

      <Card className="w-full max-w-lg mt-10 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Start a New Course</CardTitle>
          <CardDescription>What do you want to learn today?</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="e.g., 'Data Structures in C'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg">
                Start Learning
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
