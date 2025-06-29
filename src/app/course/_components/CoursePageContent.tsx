"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { CourseProvider } from '@/contexts/CourseContext';
import { CourseDashboard } from './CourseDashboard';
import { Button } from '@/components/ui/button';

export function CoursePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const topic = searchParams.get('topic');

    if (!topic) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center text-center p-4">
                <h2 className="text-2xl font-bold">No Topic Provided</h2>
                <p className="text-muted-foreground mt-2">Please go back to the homepage to start a new course.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
            </div>
        )
    }

    return (
        <CourseProvider topic={topic}>
            <CourseDashboard />
        </CourseProvider>
    );
}
