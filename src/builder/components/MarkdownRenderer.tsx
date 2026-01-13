import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-sm font-bold mt-2 mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xs font-bold mt-2 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-semibold mt-1.5 mb-0.5">{children}</h3>,
          p: ({ children }) => <p className="text-[10px] my-1 whitespace-pre-wrap">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 my-1 text-[10px]">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 my-1 text-[10px]">{children}</ol>,
          li: ({ children }) => <li className="my-0.5">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-[9px] font-mono">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted-foreground/20 p-2 rounded text-[9px] overflow-x-auto my-1">{children}</pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
