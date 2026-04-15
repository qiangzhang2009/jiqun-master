'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { prohibitedWords, categories } from '@/lib/rules/prohibited-words';

type CheckResult = {
  word: string;
  category: string;
  type: 'prohibited' | 'warning';
  replacement?: string;
  position: number;
};

function checkText(text: string): CheckResult[] {
  const results: CheckResult[] = [];
  const lower = text.toLowerCase();

  for (const category of categories) {
    for (const item of category.words) {
      const word = item.word.toLowerCase();
      let pos = lower.indexOf(word);
      while (pos !== -1) {
        results.push({
          word: text.slice(pos, pos + word.length),
          category: category.name,
          type: item.type,
          replacement: item.replacement,
          position: pos,
        });
        pos = lower.indexOf(word, pos + 1);
      }
    }
  }

  return results.sort((a, b) => a.position - b.position);
}

function getScore(results: CheckResult[], textLen: number): { score: number; level: 'safe' | 'warning' | 'danger' } {
  if (results.length === 0) return { score: 100, level: 'safe' };
  const penalty = results.reduce((acc, r) => acc + (r.type === 'prohibited' ? 8 : 4), 0);
  const score = Math.max(0, 100 - penalty);
  let level: 'safe' | 'warning' | 'danger' = 'safe';
  if (score < 60) level = 'danger';
  else if (score < 85) level = 'warning';
  return { score, level };
}

function highlightText(text: string, results: CheckResult[]): React.ReactNode {
  if (results.length === 0) return text;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  results.forEach((r, i) => {
    if (r.position > lastIndex) {
      parts.push(<span key={`t-${i}`}>{text.slice(lastIndex, r.position)}</span>);
    }
    parts.push(
      <span
        key={`h-${i}`}
        className={r.type === 'prohibited' ? 'prohibited-highlight' : 'warning-highlight'}
        title={`${r.category}：建议改为"${r.replacement || '删除'}"`}
      >
        {r.word}
      </span>
    );
    lastIndex = r.position + r.word.length;
  });
  if (lastIndex < text.length) parts.push(<span key="tail">{text.slice(lastIndex)}</span>);
  return parts;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function CheckPage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<CheckResult[]>([]);
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCheck = useCallback(() => {
    const res = checkText(input);
    setResults(res);
    setChecked(true);
  }, [input]);

  const scoreData = getScore(results, input.length);

  const scoreClass = scoreData.level === 'danger' ? 'score-low' : scoreData.level === 'warning' ? 'score-mid' : 'score-high';
  const scoreLabel = scoreData.level === 'danger' ? '高风险' : scoreData.level === 'warning' ? '需注意' : '合规';

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, CheckResult[]>);

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanedText = input
    .split(new RegExp(results.map(r => r.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi'))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/12 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">净言 · 合规检测</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">粘贴笔记正文或标题，实时检测违禁词，降低限流风险</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Input */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                笔记正文 / 标题
              </label>
              <textarea
                className="zen-textarea h-64"
                placeholder="粘贴笔记内容到这里，支持标题、正文、标签……"
                value={input}
                onChange={e => { setInput(e.target.value); setChecked(false); }}
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">{input.length} 字</span>
                <button
                  className="zen-btn zen-btn-primary"
                  onClick={handleCheck}
                  disabled={!input.trim()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  检测合规
                </button>
              </div>

              {/* Quick insert */}
              <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
                <p className="text-xs text-[var(--text-muted)] mb-3">快速测试示例</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    '业力会决定你的因果报应',
                    '念经可以治病、根治一切烦恼',
                    '这是最最最有效的修行方法',
                    '佛菩萨保佑你心想事成',
                    '如何通过冥想缓解焦虑失眠',
                  ].map((t, i) => (
                    <button
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
                      onClick={() => { setInput(t); setChecked(false); }}
                    >
                      {t.slice(0, 12)}{t.length > 12 ? '…' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Results */}
            <div>
              {!checked ? (
                <div className="zen-card h-full flex flex-col items-center justify-center text-center p-10 min-h-[320px]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <p className="mt-4 text-sm text-[var(--text-muted)]">输入内容后点击「检测合规」</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">结果将显示在右侧</p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  {/* Score card */}
                  <div className="zen-card p-6 mb-5">
                    <div className="flex items-center gap-5">
                      <div className={`score-badge ${scoreClass}`}>{scoreData.score}</div>
                      <div>
                        <p className="font-medium text-base">
                          {scoreData.level === 'danger' && <span className="text-[var(--accent-red)]">{scoreLabel}</span>}
                          {scoreData.level === 'warning' && <span className="text-[var(--accent-warm)]">{scoreLabel}</span>}
                          {scoreData.level === 'safe' && <span className="text-[var(--accent-primary)]">{scoreLabel}</span>}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          发现 {results.filter(r => r.type === 'prohibited').length} 个违禁词，{results.filter(r => r.type === 'warning').length} 个需注意词
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {input.length} 字 · 合规评分 {scoreData.score}/100
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlighted preview */}
                  <div className="zen-card p-5 mb-5">
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">预览</p>
                    <div className="text-sm leading-relaxed">
                      {highlightText(input, results)}
                    </div>
                  </div>

                  {/* Issues list */}
                  {results.length > 0 ? (
                    <div className="zen-card p-5">
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
                        问题列表
                      </p>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {Object.entries(grouped).map(([cat, items]) => (
                          <div key={cat}>
                            <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">{cat}</p>
                            {(items as CheckResult[]).map((r, i) => (
                              <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[var(--border-light)] last:border-0">
                                <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${r.type === 'prohibited' ? 'bg-[var(--accent-red)]' : 'bg-[var(--accent-warm)]'}`}/>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm text-[var(--accent-red)] font-medium mr-2">&quot;{r.word}&quot;</span>
                                  {r.replacement && (
                                    <span className="text-xs text-[var(--text-muted)]">→ 建议改为 &quot;{r.replacement}&quot;</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="zen-card p-8 text-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" className="mx-auto">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <p className="mt-3 text-sm text-[var(--text-primary)] font-medium">检测通过</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">未发现违禁词，可以发布</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
