'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type TitleType = {
  id: string;
  name: string;
  example: string;
  emoji: string;
};

const TITLE_TYPES: TitleType[] = [
  {
    id: 'mystery',
    name: '悬疑式',
    example: '法师说：越想放下，越放不下……',
    emoji: '?',
  },
  {
    id: 'pain_point',
    name: '痛点式',
    example: '为什么你总是内耗？因为你误解了这件事',
    emoji: '!',
  },
  {
    id: 'number',
    name: '数字冲击',
    example: '法师用一个字，道破了焦虑的根源',
    emoji: '#',
  },
  {
    id: 'identity',
    name: '身份代入',
    example: '给所有觉得自己不够好的人，法师的3句话',
    emoji: '@',
  },
  {
    id: 'emotion',
    name: '情绪共鸣',
    example: '读完法师这段话，我哭了',
    emoji: '~',
  },
];

const titleTemplates: Record<string, string[]> = {
  mystery: [
    '法师说：越想放下，越放不下……',
    '法师一语道破：为什么越努力越焦虑？',
    '法师：99%的人都在修「假佛学」',
    '法师说：放下，不是放弃',
    '法师这一句话，治好了我的精神内耗',
  ],
  pain_point: [
    '为什么你总是焦虑？因为你误解了这两件事',
    '法师：你的「不配得感」，来自这里',
    '法师开示：越想开，越想不开？',
    '为什么你学佛多年，还是不快乐？',
    '法师：不是世界太卷，是你太较真',
  ],
  number: [
    '法师用一个字，道破了焦虑的根源',
    '法师：3句话，让你放下执念',
    '法师：修行做好这2件事，足够了',
    '法师：人生99%的痛苦，来自于这一个字',
    '3个法师教我的修行方法，受用终身',
  ],
  identity: [
    '给所有觉得自己不够好的人，法师的3句话',
    '给正在焦虑的你：法师说，不必焦虑',
    '给觉得自己没有进步的人：法师的提醒',
    '给所有想放下过去的人：法师的方法',
    '给修行很久却没有进步的人：法师说',
  ],
  emotion: [
    '读完法师这段话，我哭了',
    '法师这段话，治好了我的精神内耗',
    '看哭了：法师说，这才是真正的放下',
    '法师这段话，点醒了迷茫的我',
    '被法师这段话深深触动，分享给你',
  ],
};

function generateTitles(topic: string, types: string[]): string[] {
  const titles: string[] = [];
  for (const type of types) {
    const templates = titleTemplates[type] || [];
    for (const tpl of templates) {
      titles.push(
        tpl
          .replace(/法师/g, topic.includes('佛') || topic.includes('法师') ? '' : '法师')
          .replace(/修行/g, '修炼')
          .replace(/焦虑/g, topic.includes('焦虑') ? '焦虑' : topic.includes('内耗') ? '内耗' : '焦虑')
          + (topic && !tpl.includes(topic) ? `——${topic}` : '')
      );
    }
  }
  return [...new Set(titles)].slice(0, 20);
}

function copyText(text: string, setCopied: (t: string) => void) {
  navigator.clipboard.writeText(text);
  setCopied(text);
  setTimeout(() => setCopied(''), 2000);
}

export default function TitlePage() {
  const [topic, setTopic] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['mystery', 'pain_point']);
  const [titles, setTitles] = useState<string[]>([]);
  const [copied, setCopied] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleToggleType = (id: string) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (!topic.trim() || selectedTypes.length === 0) return;
    const results = generateTitles(topic, selectedTypes);
    setTitles(results);
    setGenerated(true);
  };

  const charCount = (t: string) => t.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').length;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-warm)]/12 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/>
                  <line x1="10" y1="1" x2="10" y2="4"/>
                  <line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">钩子 · 爆款标题生成</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">输入主题，生成20个备选标题，找到最适合的那个</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Input section */}
          <div className="zen-card p-6 mb-6">
            <label className="block text-sm font-medium mb-3">笔记主题 / 关键词</label>
            <input
              className="zen-input"
              placeholder="例如：焦虑、内耗、放下执念、修行、情绪管理……"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />

            <label className="block text-sm font-medium mt-6 mb-3">标题类型</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {TITLE_TYPES.map(type => {
                const active = selectedTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    className={`p-3 rounded-[var(--radius-sm)] border text-left transition-all ${
                      active
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/8 text-[var(--accent-primary)]'
                        : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--bg-secondary)]'
                    }`}
                    onClick={() => handleToggleType(type.id)}
                  >
                    <p className="text-base mb-1">{type.emoji}</p>
                    <p className="text-xs font-medium">{type.name}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 hidden sm:block">{type.example.slice(0, 20)}…</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                已选 {selectedTypes.length} 种类型 · 将生成 {selectedTypes.length * 5} 个标题
              </p>
              <button
                className="zen-btn zen-btn-warm"
                onClick={handleGenerate}
                disabled={!topic.trim() || selectedTypes.length === 0}
                style={{
                  background: 'var(--accent-warm)',
                  color: 'white',
                  opacity: (!topic.trim() || selectedTypes.length === 0) ? 0.5 : 1,
                  cursor: (!topic.trim() || selectedTypes.length === 0) ? 'not-allowed' : 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                生成标题
              </button>
            </div>
          </div>

          {/* Results */}
          {generated && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-semibold">生成的标题</h2>
                <span className="text-xs text-[var(--text-muted)]">{titles.length} 个</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {titles.map((title, i) => {
                  const len = charCount(title);
                  const lenOk = len >= 10 && len <= 30;
                  return (
                    <div
                      key={i}
                      className="zen-card p-4 flex items-start gap-3 group"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                        <span className="text-xs font-medium text-[var(--text-muted)]">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">{title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              lenOk ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' : 'bg-[var(--accent-warm)]/10 text-[var(--accent-warm)]'
                            }`}
                          >
                            {len}字 {lenOk ? '✓' : '偏' + (len < 10 ? '短' : '长')}
                          </span>
                        </div>
                      </div>
                      <button
                        className="flex-shrink-0 zen-btn zen-btn-ghost text-xs opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
                        onClick={() => copyText(title, setCopied)}
                        title="复制"
                      >
                        {copied === title ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!generated && (
            <div className="zen-card p-12 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" strokeLinecap="round" className="mx-auto">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              </svg>
              <p className="mt-4 text-sm text-[var(--text-muted)]">输入主题，选择标题类型，即可生成</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">选多种类型可获得更丰富的标题组合</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
