import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://zenjing.vercel.app'),
  title: {
    default: '禅镜 — 小红书运营工具',
    template: '%s | 禅镜',
  },
  description: '专为佛学、心灵成长类创作者设计的小红书运营工具。让弘法之道，行于指尖。一站式解决标题、标签、翻译、合规检测、封面图、发布日历、账号诊断。',
  keywords: [
    '小红书运营工具',
    '佛学内容创作',
    '心灵成长',
    '小红书标题生成',
    '违禁词检测',
    '小红书标签',
    '佛法自媒体',
    '禅修',
    '正念',
  ],
  authors: [{ name: '禅镜' }],
  creator: '禅镜',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://zenjing.vercel.app',
    siteName: '禅镜',
    title: '禅镜 — 小红书运营工具',
    description: '专为佛学、心灵成长类创作者设计的小红书运营工具，让弘法之道，行于指尖。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '禅镜 — 小红书运营工具',
    description: '专为佛学、心灵成长类创作者设计的小红书运营工具',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
