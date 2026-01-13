import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <span className="block text-[11px] font-bold mt-1.5 mb-0.5">{children}</span>,
          h2: ({ children }) => <span className="block text-[10px] font-bold mt-1.5 mb-0.5">{children}</span>,
          h3: ({ children }) => <span className="block text-[10px] font-semibold mt-1 mb-0.5">{children}</span>,
          p: ({ children }) => <span className="block text-[10px] my-0.5">{children}</span>,
          ul: ({ children }) => <ul className="list-disc pl-3 my-0.5 text-[10px] space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-3 my-0.5 text-[10px] space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="text-[10px]">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="bg-background/50 px-1 py-0.5 rounded text-[9px] font-mono">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-background/50 p-1.5 rounded text-[9px] overflow-x-auto my-1 whitespace-pre-wrap break-all">{children}</pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
