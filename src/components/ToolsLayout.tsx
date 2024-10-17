import Footer from '@/components/footer';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Footer />
      </div>
    </div>
  );
}