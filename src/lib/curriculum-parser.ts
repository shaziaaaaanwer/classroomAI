// This file is no longer used and can be safely deleted.
// The curriculum generation now uses structured JSON output from the AI
// instead of parsing text.

export interface Lesson {
  title: string;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export const parseCurriculum = (text: string): Module[] => {
  if (!text) return [];

  const lines = text.split('\n').filter(line => line.trim() !== '');
  const modules: Module[] = [];
  let currentModule: Module | null = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    const isModule = trimmedLine.startsWith('# ') || trimmedLine.match(/^Module \d+:/i);
    const isLesson = trimmedLine.startsWith('## ') || trimmedLine.match(/^(Lesson \d+\.\d+:|- |\* |\d+\.\s)/i);

    if (isModule) {
      if (currentModule) {
        modules.push(currentModule);
      }
      const title = trimmedLine.replace(/^#\s*|^Module \d+:\s*/i, '').trim();
      currentModule = { title, lessons: [] };
    } else if (isLesson && currentModule) {
      const title = trimmedLine.replace(/^##\s*|^Lesson \d+\.\d+:\s*|(-\s*)|(\*\s*)|(\d+\.\s*)/i, '').trim();
      currentModule.lessons.push({ title });
    } else if (currentModule && trimmedLine) {
        // Fallback for lines that are not module/lesson headers but are under a module
        currentModule.lessons.push({ title: trimmedLine });
    }
  });

  if (currentModule) {
    modules.push(currentModule);
  }

  return modules;
};
