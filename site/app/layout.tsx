import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 新职业雷达',
  description: '追踪企业开始反复付钱购买的 AI 新任务，判断哪些值得现在进入。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
