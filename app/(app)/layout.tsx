import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { MobileTabBar } from '@/components/layout/mobile-tab-bar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="container mx-auto flex px-0">
        <Sidebar />
        <main id="main-content" className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <Footer />
      <MobileTabBar />
    </>
  );
}
