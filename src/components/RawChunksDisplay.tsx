import React from 'react';

interface RawChunksDisplayProps {
  chunks: string[];
}

const RawChunksDisplay: React.FC<RawChunksDisplayProps> = ({ chunks }) => {
  return (
    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Raw OpenAI Chunks</h2>
      <div className="max-h-96 overflow-y-auto">
        {chunks.map((chunk, index) => (
          <div key={index} className="mb-2 p-2 bg-white dark:bg-gray-700 rounded">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">{chunk}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RawChunksDisplay;