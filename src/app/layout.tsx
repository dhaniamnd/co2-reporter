import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cement CO₂ Reporter',
  description: 'Upload, calculate, and report cement plant CO₂ per CSI Protocol.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--page-bg)] text-gray-900">
        <header className="border-b bg-[var(--header-bg)] text-white">
          <div className="container flex items-center justify-between py-4">
            <h1 className="text-xl font-semibold">Cement Plants CO₂ Emission Reporter</h1>
            <div className="text-xs text-white">CSI CO₂ & Energy Protocol-aligned</div>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="container py-8 text-center text-sm text-gray-500"></footer>
      </body>
    </html>
  );
}