'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type Tag = {
  name: string;
  type: 'core' | 'longtail';
  searchVolume: 'high' | 'medium' | 'low';
  competition: 'high' | 'medium' | 'low';
  note?: string;
};

const BUDDHIST_TAGS: Tag[] = [
  { name: '佛法', type: 'core', searchVolume: 'high', competition: 'high', note: '大词，竞争激烈' },
  { name: '禅修', type: 'core', searchVolume: 'high', competition: 'medium', note: '适合禅修类内容' },
  { name: '心灵成长', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '修行', type: 'core', searchVolume: 'high', competition: 'high' },
  { name: '金刚经', type: 'core', searchVolume: 'medium', competition: 'low', note: '垂直精准' },
  { name: '心经', type: 'core', searchVolume: 'medium', competition: 'low' },
  { name: '六祖坛经', type: 'core', searchVolume: 'low', competition: 'low' },
  { name: '皈依', type: 'longtail', searchVolume: 'medium', competition: 'low' },
  { name: '戒律', type: 'longtail', searchVolume: 'low', competition: 'low' },
  { name: '唯识', type: 'longtail', searchVolume: 'low', competition: 'low', note: '学术型受众' },
  { name: '正念', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '内观', type: 'longtail', searchVolume: 'medium', competition: 'low' },
  { name: '打坐', type: 'longtail', searchVolume: 'medium', competition: 'low' },
  { name: '冥想', type: 'core', searchVolume: 'high', competition: 'high' },
  { name: '焦虑', type: 'core', searchVolume: 'high', competition: 'high', note: '情绪痛点' },
  { name: '情绪管理', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '自我成长', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '人生哲学', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '素食', type: 'longtail', searchVolume: 'medium', competition: 'medium' },
  { name: '放生', type: 'longtail', searchVolume: 'low', competition: 'low' },
  { name: '供灯', type: 'longtail', searchVolume: 'low', competition: 'low' },
  { name: '寺院', type: 'longtail', searchVolume: 'medium', competition: 'low' },
  { name: '出家', type: 'longtail', searchVolume: 'medium', competition: 'low' },
  { name: '济群法师', type: 'longtail', searchVolume: 'low', competition: 'low', note: '人名标签，精准引流' },
  { name: '人生佛教', type: 'longtail', searchVolume: 'low', competition: 'low', note: '济群法师核心理念' },
  { name: '智慧', type: 'core', searchVolume: 'high', competition: 'high' },
  { name: '福报', type: 'longtail', searchVolume: 'medium', competition: 'low' },
  { name: '无常', type: 'longtail', searchVolume: 'low', competition: 'low' },
  { name: '因缘', type: 'longtail', searchVolume: 'low', competition: 'low' },
  { name: '空性', type: 'longtail', searchVolume: 'low', competition: 'low' },
];

const GENERAL_TAGS: Tag[] = [
  { name: '自我成长', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '正能量', type: 'core', searchVolume: 'high', competition: 'high' },
  { name: '治愈', type: 'core', searchVolume: 'high', competition: 'high' },
  { name: '读书', type: 'core', searchVolume: 'high', competition: 'high' },
  { name: '学习', type: 'core', searchVolume: 'high', competition: 'high' },
  { name: '生活方式', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '思考', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '觉悟', type: 'longtail', searchVolume: 'medium', competition: 'low' },
  { name: '放下', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '活在当下', type: 'longtail', searchVolume: 'medium', competition: 'low' },
  { name: '断舍离', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '极简生活', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '心理学', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '认知', type: 'core', searchVolume: 'high', competition: 'medium' },
  { name: '人生智慧', type: 'core', searchVolume: 'high', competition: 'medium' },
];

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['的', '了', '是', '在', '和', '与', '为', '有', '我', '你', '他', '她', '它', '这', '那', '就', '都', '而', '及', '与', '或', '不', '也', '但', '还', '又', '要', '会', '能', '可', '很', '非常', '一个', '什么', '怎么', '如果', '因为', '所以', '但是', '虽然', '然后', '可以', '应该', '已经', '关于', '通过', '以及', '或者', '并且', '而且', '只是', '由于', '因此', '作为', '对于', '通过', '经过', '根据', '按照', '为了', '关于', '来自', '达到', '进行', '出现', '成为', '产生', '这个', '那个', '自己', '大家', '没有', '之后', '之前', '之间', '以后', '以前', '这些', '那些', '其中', '如此', '这么', '那么', '怎样', '多少', '哪个', '哪些', '哪里', '谁', '怎样', '如何', '为何', '时候', '地方', '方式', '原因', '结果', '过程', '阶段', '情况', '问题', '方面', '方法', '作用', '意义', '价值', '目标', '内容', '形式', '特点', '特征', '条件', '因素', '程度', '水平', '状态', '效果', '影响', '关系', '联系', '区别', '差异', '共性', '性质', '本质', '概念', '定义', '范畴', '原理', '规律', '法则', '原则', '标准', '规范', '要求', '任务', '职能', '职责', '权利', '义务', '责任']);
  const words: string[] = [];
  let current = '';
  for (const char of text) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      current += char;
    } else {
      if (current.length >= 2 && !stopWords.has(current)) {
        words.push(current);
      }
      current = '';
    }
  }
  if (current.length >= 2 && !stopWords.has(current)) {
    words.push(current);
  }
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

function findTags(keywords: string[]): Tag[] {
  const allTags = [...BUDDHIST_TAGS, ...GENERAL_TAGS];
  const results: Tag[] = [];

  // Direct match
  for (const kw of keywords) {
    for (const tag of allTags) {
      if (tag.name.includes(kw) || kw.includes(tag.name)) {
        if (!results.find(r => r.name === tag.name)) {
          results.push(tag);
        }
      }
    }
  }

  // Fill to at least 5 core + 3 longtail
  const coreTags = results.filter(t => t.type === 'core');
  const ltTags = results.filter(t => t.type === 'longtail');

  const neededCore = Math.max(0, 1 - coreTags.length);
  const neededLt = Math.max(0, 3 - ltTags.length);

  for (const tag of allTags) {
    if (results.length >= 5) break;
    if (!results.find(r => r.name === tag.name)) {
      results.push(tag);
    }
  }

  return results.slice(0, 5);
}

function VolumeDot({ level }: { level: 'high' | 'medium' | 'low' }) {
  const color = level === 'high' ? 'var(--accent-primary)' : level === 'medium' ? 'var(--accent-warm)' : 'var(--text-muted)';
  return (
    <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} title={`搜索量: ${level === 'high' ? '高' : level === 'medium' ? '中' : '低'}`} />
  );
}

export default function TagsPage() {
  const [input, setInput] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    const kw = extractKeywords(input);
    setKeywords(kw);
    const found = findTags(kw);
    setTags(found);
    setGenerated(true);
  };

  const copyAll = () => {
    const tagStr = tags.map(t => '#' + t.name).join(' ');
    navigator.clipboard.writeText(tagStr);
  };

  const copyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-light)]/15 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">灵签 · 标签推荐</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">输入笔记内容，智能推荐1~2个核心标签 + 3~4个长尾标签</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="zen-card p-6 mb-6">
            <label className="block text-sm font-medium mb-3">笔记正文 / 主题</label>
            <textarea
              className="zen-textarea h-36"
              placeholder="输入笔记内容或主题关键词……\n\n系统会分析内容主题，结合佛教/心灵成长垂直标签库，推荐最优标签组合。"
              value={input}
              onChange={e => { setInput(e.target.value); setGenerated(false); }}
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">{input.length} 字</span>
              <button className="zen-btn zen-btn-primary" onClick={handleGenerate} disabled={!input.trim()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                推荐标签
              </button>
            </div>
          </div>

          {/* Extracted keywords */}
          {generated && keywords.length > 0 && (
            <div className="zen-card p-5 mb-5 animate-fade-in">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">识别到的关键词</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <button
                    key={i}
                    className="tag-chip"
                    onClick={() => copyKeyword(kw)}
                    title="点击复制"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags result */}
          {generated && tags.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg font-semibold">推荐标签组合</h2>
                <button className="zen-btn zen-btn-primary text-sm" onClick={copyAll}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  复制全部
                </button>
              </div>

              {/* Core tags */}
              <div className="mb-5">
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">核心标签（搜索量大，1~2个）</p>
                <div className="flex flex-wrap gap-3">
                  {tags.filter(t => t.type === 'core').map((t, i) => (
                    <div key={i} className="zen-card px-4 py-3 flex items-center gap-3">
                      <span className="font-medium text-[var(--text-primary)]">#{t.name}</span>
                      <div className="flex items-center gap-1.5">
                        <VolumeDot level={t.searchVolume} />
                        <span className="text-xs text-[var(--text-muted)]">
                          {t.searchVolume === 'high' ? '搜索高' : t.searchVolume === 'medium' ? '搜索中' : '搜索低'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Longtail tags */}
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">长尾标签（竞争小，3~4个）</p>
                <div className="flex flex-wrap gap-3">
                  {tags.filter(t => t.type === 'longtail').map((t, i) => (
                    <div key={i} className="zen-card px-4 py-3 flex items-center gap-3">
                      <span className="font-medium text-[var(--text-primary)]">#{t.name}</span>
                      {t.note && <span className="text-xs text-[var(--text-muted)]">{t.note}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] text-xs text-[var(--text-muted)]">
                <strong>使用建议：</strong>核心标签选1个最相关的，长尾标签选3个左右，总标签数不超过10个。
                标签太杂会影响系统推荐精准度。
              </div>
            </div>
          )}

          {!generated && (
            <div className="zen-card p-12 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" strokeLinecap="round" className="mx-auto">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <p className="mt-4 text-sm text-[var(--text-muted)]">输入内容后点击「推荐标签」</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
