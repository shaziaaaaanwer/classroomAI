import { BookOpenCheck } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpenCheck className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-headline">ClassroomAI</span>
        </Link>
      </div>
    </header>
  );
}
