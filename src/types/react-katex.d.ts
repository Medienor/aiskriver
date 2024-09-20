declare module 'react-katex' {
    import React from 'react';
    
    export interface InlineMathProps {
      math: string;
    }
    
    export interface BlockMathProps {
      math: string;
    }
    
    export const InlineMath: React.FC<InlineMathProps>;
    export const BlockMath: React.FC<BlockMathProps>;
  }