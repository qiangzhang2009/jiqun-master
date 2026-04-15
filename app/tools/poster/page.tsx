'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type PosterTemplate = {
  id: string;
  name: string;
  nameEn: string;
  bg: string;
  textColor: string;
  accentColor: string;
  style: 'dark' | 'light' | 'warm' | 'minimal';
  fontFamily: string;
  fontWeight: string;
};

const TEMPLATES: PosterTemplate[] = [
  {
    id: 'zenmo',
    name: '禅墨',
    nameEn: 'Dark Ink',
    bg: '#1C1B18',
    textColor: '#F5F0E8',
    accentColor: '#C9B896',
    style: 'dark',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
  {
    id: 'suxuan',
    name: '素宣',
    nameEn: 'Rice Paper',
    bg: '#F0EBE0',
    textColor: '#3A3530',
    accentColor: '#8B7355',
    style: 'light',
    fontFamily: 'Noto Serif SC',
    fontWeight: '400',
  },
  {
    id: 'jingbai',
    name: '净白',
    nameEn: 'Pure White',
    bg: '#FAFAF8',
    textColor: '#1C1B18',
    accentColor: '#C0B8A8',
    style: 'minimal',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
  },
  {
    id: 'nuanyang',
    name: '暖阳',
    nameEn: 'Warm Sun',
    bg: '#F5E8D4',
    textColor: '#5C3D1E',
    accentColor: '#A0704A',
    style: 'warm',
    fontFamily: 'Noto Sans SC',
    fontWeight: '500',
  },
  {
    id: 'muzhong',
    name: '暮钟',
    nameEn: 'Evening Bell',
    bg: '#1E2D35',
    textColor: '#D4AF6A',
    accentColor: '#8A6A3A',
    style: 'dark',
    fontFamily: 'Noto Serif SC',
    fontWeight: '600',
  },
];

function PosterCanvas({ template, quote }: { template: PosterTemplate; quote: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 3:4 ratio, 810x1080 px for high quality
    canvas.width = 810;
    canvas.height = 1080;

    // Background
    ctx.fillStyle = template.bg;
    ctx.fillRect(0, 0, 810, 1080);

    // Add texture overlay for some templates
    if (template.id === 'zenmo' || template.id === 'muzhong') {
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.random() * 810, Math.random() * 1080, Math.random() * 3, Math.random() * 3);
      }
      ctx.globalAlpha = 1;
    }

    // Decorative line top
    ctx.fillStyle = template.accentColor;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(60, 60, 120, 1.5);
    ctx.globalAlpha = 1;

    // Quote text - auto wrap
    const maxWidth = 690;
    const fontSize = quote.length > 30 ? 38 : 44;
    ctx.font = `${template.fontWeight} ${fontSize}px ${template.fontFamily}`;
    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = wrapText(ctx, quote, maxWidth);
    const lineHeight = fontSize * 1.6;
    const totalHeight = lines.length * lineHeight;
    const startY = 540 - totalHeight / 2 + lineHeight / 2;

    lines.forEach((line, i) => {
      ctx.fillText(line, 405, startY + i * lineHeight);
    });

    // Decorative element
    ctx.fillStyle = template.accentColor;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(355, startY + lines.length * lineHeight + 40, 100, 1);
    ctx.globalAlpha = 1;

    // Branding watermark
    ctx.font = '400 20px Noto Serif SC';
    ctx.fillStyle = template.accentColor;
    ctx.globalAlpha = 0.4;
    ctx.fillText('禅镜 · 弘法利生', 405, 980);
    ctx.globalAlpha = 1;
  }, [template, quote]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const paragraphs = text.split('\n');
    const result: string[] = [];

    for (const para of paragraphs) {
      if (para.trim() === '') {
        result.push('');
        continue;
      }
      const words = para.split('');
      let line = '';
      for (const char of words) {
        const testLine = line + char;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line.length > 0) {
          result.push(line);
          line = char;
        } else {
          line = testLine;
        }
      }
      if (line) result.push(line);
    }
    return result;
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[270px] rounded-lg shadow-lg mx-auto"
      style={{ aspectRatio: '3/4' }}
    />
  );
}

export default function PosterPage() {
  const [quote, setQuote] = useState('心无挂碍，无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃。');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleDownload = () => {
    if (!quote.trim()) return;
    setDownloading(true);

    // Create a temporary canvas at full resolution
    const canvas = document.createElement('canvas');
    canvas.width = 810;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = selectedTemplate;
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, 810, 1080);

    if (t.id === 'zenmo' || t.id === 'muzhong') {
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.random() * 810, Math.random() * 1080, Math.random() * 3, Math.random() * 3);
      }
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = t.accentColor;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(60, 60, 120, 1.5);
    ctx.globalAlpha = 1;

    const maxWidth = 690;
    const fontSize = quote.length > 30 ? 38 : 44;
    ctx.font = `${t.fontWeight} ${fontSize}px ${t.fontFamily}`;
    ctx.fillStyle = t.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const wrapLines = (text: string): string[] => {
      const paragraphs = text.split('\n');
      const result: string[] = [];
      for (const para of paragraphs) {
        if (para.trim() === '') { result.push(''); continue; }
        const words = para.split('');
        let line = '';
        for (const char of words) {
          const testLine = line + char;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line.length > 0) {
            result.push(line);
            line = char;
          } else {
            line = testLine;
          }
        }
        if (line) result.push(line);
      }
      return result;
    };

    const lines = wrapLines(quote);
    const lineHeight = fontSize * 1.6;
    const totalHeight = lines.length * lineHeight;
    const startY = 540 - totalHeight / 2 + lineHeight / 2;
    lines.forEach((line, i) => ctx.fillText(line, 405, startY + i * lineHeight));

    ctx.fillStyle = t.accentColor;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(355, startY + lines.length * lineHeight + 40, 100, 1);
    ctx.globalAlpha = 1;
    ctx.font = '400 20px Noto Serif SC';
    ctx.fillStyle = t.accentColor;
    ctx.globalAlpha = 0.4;
    ctx.fillText('禅镜 · 弘法利生', 405, 980);
    ctx.globalAlpha = 1;

    // Download
    const link = document.createElement('a');
    link.download = `禅镜-${t.name}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--text-secondary)]/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">墨境 · 金句图文</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">输入法师金句，选择模板，一键生成小红书封面图（3:4比例）</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Config */}
            <div>
              <div className="zen-card p-6 mb-6">
                <label className="block text-sm font-medium mb-3">法师金句</label>
                <textarea
                  className="zen-textarea h-36"
                  placeholder="输入你想生成封面图的法师金句……"
                  value={quote}
                  onChange={e => setQuote(e.target.value)}
                />
                <p className="text-xs text-[var(--text-muted)] mt-2">{quote.length} 字 · 建议15~40字</p>

                {/* Examples */}
                <div className="mt-5 pt-5 border-t border-[var(--border-light)]">
                  <p className="text-xs text-[var(--text-muted)] mb-3">经典金句示例</p>
                  <div className="space-y-2">
                    {[
                      '心无挂碍，无挂碍故，无有恐怖',
                      '一切众生皆具如来智慧德相',
                      '修行不是让自己变得更好，而是认出自己本来就很好',
                      '放下，不是放弃；看破，不是看透',
                      '不是风动，不是幡动，仁者心动',
                    ].map((q, i) => (
                      <button
                        key={i}
                        className="w-full text-left text-xs px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors"
                        onClick={() => setQuote(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="zen-card p-6">
                <label className="block text-sm font-medium mb-4">选择模板</label>
                <div className="space-y-3">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      className={`w-full p-3 rounded-[var(--radius-sm)] border transition-all flex items-center gap-4 ${
                        selectedTemplate.id === t.id
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/8'
                          : 'border-[var(--border)] hover:border-[var(--accent-light)]'
                      }`}
                      onClick={() => setSelectedTemplate(t)}
                    >
                      {/* Color preview */}
                      <div className="flex-shrink-0 flex gap-1">
                        <div className="w-5 h-7 rounded-sm" style={{ backgroundColor: t.bg }} />
                        <div className="w-5 h-7 rounded-sm" style={{ backgroundColor: t.textColor }} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{t.nameEn}</p>
                      </div>
                      {selectedTemplate.id === t.id && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  className="zen-btn zen-btn-primary w-full mt-5"
                  onClick={handleDownload}
                  disabled={!quote.trim()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  下载封面图
                </button>
              </div>
            </div>

            {/* Right: Preview */}
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">预览</p>
              <div className="sticky top-24">
                <PosterCanvas template={selectedTemplate} quote={quote || '心无挂碍，无挂碍故，无有恐怖'} />
                <div className="mt-6 zen-card p-5">
                  <p className="text-sm font-medium mb-2">使用说明</p>
                  <ul className="text-xs text-[var(--text-secondary)] space-y-1.5">
                    <li>· 下载后直接上传小红书作为图文封面</li>
                    <li>· 建议图片笔记封面尺寸 3:4（竖版）</li>
                    <li>· 可配合「净言」检测合规后再使用</li>
                    <li>· 金句内容建议15~40字，过长会自动换行</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
