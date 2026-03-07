import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background w-full" style={{ minHeight: '-webkit-fill-available' }}>
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20 w-full max-w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
