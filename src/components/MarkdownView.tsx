import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export default function MarkdownView({ content }: MarkdownViewProps) {
  if (!content) return <p className="text-slate-400 italic text-sm">No analysis provided.</p>;

  const lines = content.split('\n');

  const parseInlineStyles = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const tokenRegex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }
      if (match[2]) {
        parts.push(
          <strong key={matchIndex} className="font-semibold text-slate-900">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(
          <code key={matchIndex} className="font-mono text-xs bg-slate-100 border border-slate-200 text-blue-700 px-1.5 py-0.5 rounded">
            {match[3]}
          </code>
        );
      }
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-700">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base font-semibold text-slate-900 mt-4 first:mt-0 border-b border-slate-100 pb-1.5">
              {trimmed.substring(4)}
            </h3>
          );
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-sm font-semibold uppercase tracking-wide text-blue-600 mt-3">
              {trimmed.substring(5)}
            </h4>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const body = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 ml-1">
              <span className="text-blue-500 mt-1.5 flex-shrink-0 text-xs">●</span>
              <span className="flex-1">{parseInlineStyles(body)}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-3 ml-1 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0">
                {numMatch[1]}
              </span>
              <span className="flex-1">{parseInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        if (trimmed === '') {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p key={idx}>{parseInlineStyles(line)}</p>
        );
      })}
    </div>
  );
}
