import React, { useEffect, useRef } from 'react';
import { useSources } from '../contexts/SourcesContext';

interface SourcesListProps {
  quill: any;
}

const SourcesList: React.FC<SourcesListProps> = ({ quill }) => {
  const { sources } = useSources();
  const sourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (quill && sourcesRef.current) {
      const sourcesHtml = `
        <h2>Sources</h2>
        <ul>
          ${sources.map(source => `<li>${source.fullCitation}</li>`).join('')}
        </ul>
      `;
      
      // Find or create a sources block at the end of the document
      const delta = quill.getContents();
      const lastOp = delta.ops[delta.ops.length - 1];
      
      if (lastOp && lastOp.insert === '\n' && lastOp.attributes && lastOp.attributes.sourcesBlock) {
        // Update existing sources block
        quill.deleteText(delta.length() - lastOp.insert.length, lastOp.insert.length);
      }
      
      // Insert the new sources block
      quill.insertText(quill.getLength(), '\n', { sourcesBlock: true });
      quill.clipboard.dangerouslyPasteHTML(quill.getLength(), sourcesHtml, 'api');
    }
  }, [quill, sources]);

  return <div ref={sourcesRef} style={{ display: 'none' }} />;
};

export default SourcesList;
