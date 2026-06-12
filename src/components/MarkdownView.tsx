import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export default function MarkdownView({ content }: MarkdownViewProps) {
  if (!content) return <p className="text-slate-400 italic">No feedback provided.</p>;

  const lines = content.split('\n');

  // Helper to parse inline bolding (**text**) or code (`text`)
  const parseInlineStyles = (text: string): React.ReactNode[] => {
    // Regex for bold ** ... **
    const parts: React.ReactNode[] = [];
    let currentText = text;

    // Direct token parsing for bolding and code blocks
    const tokenRegex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(currentText)) !== null) {
      const matchIndex = match.index;
      
      // Add text before match
      if (matchIndex > lastIndex) {
        parts.push(currentText.substring(lastIndex, matchIndex));
      }

      if (match[2]) {
        // Bold match
        parts.push(
          <strong key={matchIndex} className="font-semibold text-slate-100 bg-slate-800/20 px-1 rounded">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Code match
        parts.push(
          <code key={matchIndex} className="font-mono text-xs bg-slate-900/60 border border-slate-700 text-teal-300 px-1.5 py-0.5 rounded">
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
    <div className="space-y-3.5 text-sm leading-relaxed text-slate-300">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Match Headings (### or ####)
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base font-bold tracking-tight text-white mt-4 first:mt-0 border-b border-slate-800/60 pb-1 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-sky-500 rounded-sm inline-block"></span>
              {trimmed.substring(4)}
            </h3>
          );
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-sm font-semibold tracking-wider uppercase text-teal-400 mt-3 flex items-center gap-1.5">
              {trimmed.substring(5)}
            </h4>
          );
        }

        // Match Bullet list (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const body = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1 mt-1">
              <span className="text-sky-400 mt-1.5 flex-shrink-0">●</span>
              <span className="text-slate-300 flex-1">{parseInlineStyles(body)}</span>
            </div>
          );
        }

        // Match Number list (1. / 2. / etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const body = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-3 ml-1 mt-1.5 bg-slate-800/10 border border-slate-800/40 rounded-lg p-2.5 transition-colors hover:bg-slate-800/20">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-teal-400 text-xs font-semibold flex-shrink-0 border border-teal-500/20">
                {num}
              </span>
              <span className="text-slate-300 flex-1">{parseInlineStyles(body)}</span>
            </div>
          );
        }

        // Skip completely empty lines, but hold room for spacing
        if (trimmed === "") {
          return <div key={idx} className="h-1" />;
        }

        // Ordinary Paragraph
        return (
          <p key={idx} className="text-slate-300">
            {parseInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}
