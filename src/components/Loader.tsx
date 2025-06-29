import React from 'react';

type LoaderProps = {
  text?: string;
  className?: string;
};

export default function Loader({ text = "Generating...", className }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-8 ${className}`}>
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      {text && <p className="text-muted-foreground font-medium">{text}</p>}
    </div>
  );
}
