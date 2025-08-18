"use client";

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

interface RawFileViewerProps {
  content: string;
  maxLines?: number;
}

export default function RawFileViewer({ content, maxLines = 10 }: RawFileViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = content.split('\n');
  const displayLines = isExpanded ? lines : lines.slice(0, maxLines);
  const hasMoreLines = lines.length > maxLines;

  return (
    <div className="mt-4 border rounded-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 text-xs font-mono text-gray-500 border-b">
        File content preview
      </div>
      <div className="bg-white p-2 overflow-auto max-h-96">
        <pre className="text-xs font-mono text-gray-800">
          {displayLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              <span className="text-gray-400 select-none mr-2 w-6 inline-block text-right">
                {i + 1}
              </span>
              {line || ' '}
            </div>
          ))}
          {!isExpanded && hasMoreLines && (
            <div className="text-center text-xs text-gray-500 py-1">
              ... {lines.length - maxLines} more lines
            </div>
          )}
        </pre>
      </div>
      {hasMoreLines && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-1 text-xs text-center text-blue-600 hover:bg-gray-50 border-t flex items-center justify-center gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDownIcon className="h-4 w-4" />
              Show more
            </>
          )}
        </button>
      )}
    </div>
  );
}
