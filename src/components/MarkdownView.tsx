import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export default function MarkdownView({ content }: MarkdownViewProps) {
  if (!content) return <p className="text-slate-500 italic">No feedback provided.</p>;

  const lines = content.split('\n');

  // Helper to parse inline bolding (**text**) or code (`text`)
  const parseInlineStyles = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentText = text;

    const tokenRegex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(currentText)) !== null) {
      const matchIndex = match.index;
      
      if (matchIndex > lastIndex) {
        parts.push(currentText.substring(lastIndex, matchIndex));
      }

      if (match[2]) {
        // Bold match
        parts.push(
          <strong key={matchIndex} className="font-semibold text-slate-900 bg-purple-50 px-1 rounded border border-purple-100">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Code match
        parts.push(
          <code key={matchIndex} className="font-mono text-xs bg-slate-100 border border-slate-200 text-purple-700 px-1.5 py-0.5 rounded">
            {match[3]}
          </code>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-slate-700">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Match Headings (### or ####)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 mt-4 first:mt-0 border-b border-slate-200 pb-1 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-purple-600 rounded-sm inline-block"></span>
              {trimmed.substring(4)}
            </h3>
          );
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-xs sm:text-sm font-bold tracking-wider uppercase text-purple-700 mt-3 flex items-center gap-1.5">
              {trimmed.substring(5)}
            </h4>
          );
        }

        // Match Bullet list (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const body = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1 mt-1">
              <span className="text-purple-600 font-bold mt-1 flex-shrink-0">●</span>
              <span className="text-slate-800 flex-1">{parseInlineStyles(body)}</span>
            </div>
          );
        }

        // Match Number list (1. / 2. / etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const body = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1 mt-1.5 bg-slate-50 border border-slate-200 rounded-lg p-2.5 transition-colors">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold flex-shrink-0 border border-purple-200">
                {num}
              </span>
              <span className="text-slate-800 flex-1">{parseInlineStyles(body)}</span>
            </div>
          );
        }

        if (trimmed === "") {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p key={idx} className="text-slate-700">
            {parseInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}
