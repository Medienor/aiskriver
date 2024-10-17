// C:\Users\eines\Downloads\InnholdAI_Backup\article-dashboard\src\app\tools\layout.tsx

import { Suspense } from 'react';
import ToolsLayout from '../../components/ToolsLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolsLayout>
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </ToolsLayout>
  );
}