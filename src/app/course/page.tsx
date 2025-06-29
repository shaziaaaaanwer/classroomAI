"use client";

import { Suspense } from 'react';
import { CoursePageContent } from './_components/CoursePageContent';
import Loader from '@/components/Loader';

export default function CoursePage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader text="Loading Course..." /></div>}>
      <CoursePageContent />
    </Suspense>
  );
}
