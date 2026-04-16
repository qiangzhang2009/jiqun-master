'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type ReviewResult = {
  summary: string;
  dataAnalysis: { engagement: string; contentQuality: string; titleQuality: string };
  strengths: string[];
  weaknesses: string[];
  nextPostSuggestions: string[];
  bestPostingTime: string;
  contentDirection: string;
};

function ScoreChip({ label, score }: { label: string; score: string }) {
  const n = parseInt(score);
  const color = n >= 80 ? 'var(--accent-primary)' : n >= 60 ? 'var(--accent-warm)' : 'var(--accent-red)';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="font-bold text-lg" style={{ color }}>{score}</span>
    </div>
  );
}

export default function ReviewPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [views, setViews] = useState('');
  const [likes, setLikes] = useState('');
  const [collects, setCollects] = useState('');
  const [comments, setComments] = useState('');
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasData, setHasData] = useState(false);

  const engagementRate = views && (Number(likes) + Number(collects) + Number(comments)) > 0
    ? (((Number(likes) + Number(collects) + Number(comments)) / Number(views)) * 100).toFixed(2)
    : null;

  const handleReview = async () => {
    if (!title.trim() && !content.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, views, likes, collects, comments }),
      });
      const data = await res.json();
      if (!res.ok || !data.result) throw new Error(data.error || '复盘失败');
      setResult(data.result);
      setHasData(!!views);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setViews('');
    setLikes('');
    setCollects('');
    setComments('');
    setResult(null);
    setError('');
    setHasData(false);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/12 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">内容复盘</h1>
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] font-medium">AI</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">输入已发布笔记的内容和数据，AI 分析优缺点，给出下一篇文章的具体改进建议</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Input */}
            <div>
              <div className="zen-card p-6 mb-6">
                <h2 className="font-serif text-lg font-semibold mb-4">笔记内容</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">笔记标题</label>
                    <input
                      className="zen-input"
                      placeholder="输入这篇笔记的标题"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">正文内容（选填）</label>
                    <textarea
                      className="zen-textarea h-32"
                      placeholder="粘贴笔记正文内容，AI会分析内容质量和结构……"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">提供正文可获得更准确的内容质量评估</p>
                  </div>
                </div>
              </div>

              <div className="zen-card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg font-semibold">互动数据</h2>
                  <button className="text-xs text-[var(--accent-primary)] hover:underline" onClick={() => setHasData(!hasData)}>
                    {hasData ? '我没有数据，跳过' : '+ 填写数据'}
                  </button>
                </div>

                {hasData ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: '阅读量', key: 'views', value: views, setter: setViews, placeholder: '0' },
                        { label: '点赞数', key: 'likes', value: likes, setter: setLikes, placeholder: '0' },
                        { label: '收藏数', key: 'collects', value: collects, setter: setCollects, placeholder: '0' },
                        { label: '评论数', key: 'comments', value: comments, setter: setComments, placeholder: '0' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs text-[var(--text-muted)] mb-1.5">{f.label}</label>
                          <input
                            className="zen-input"
                            type="number"
                            placeholder={f.placeholder}
                            value={f.value}
                            onChange={e => f.setter(e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    {engagementRate && (
                      <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] text-center">
                        <span className="text-xs text-[var(--text-muted)]">互动率 </span>
                        <span className={`text-sm font-bold ${
                          parseFloat(engagementRate) >= 5 ? 'text-[var(--accent-primary)]' :
                          parseFloat(engagementRate) >= 1 ? 'text-[var(--accent-warm)]' : 'text-[var(--accent-red)]'
                        }`}>{engagementRate}%</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] text-center py-3">
                    跳过数据，仅进行内容质量分析
                  </p>
                )}
              </div>

              <button
                className="zen-btn zen-btn-primary w-full"
                onClick={handleReview}
                disabled={!title.trim() && !content.trim() || loading}
              >
                {loading ? (
                  <><svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>分析中…</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>开始复盘</>
                )}
              </button>

              {error && (
                <p className="text-xs text-[var(--accent-red)] mt-2 text-center">{error}</p>
              )}
            </div>

            {/* Right: Result */}
            <div>
              {!result ? (
                <div className="zen-card p-10 text-center">
                  <svg className="mx-auto mb-4 text-[var(--text-muted)]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  <p className="text-[var(--text-muted)] text-sm">
                    填写笔记内容后<br/>点击「开始复盘」获得分析报告
                  </p>
                </div>
              ) : (
                <div className="space-y-5 animate-fade-in">
                  {/* 综合评分 */}
                  <div className="zen-card p-6">
                    <h3 className="font-serif font-semibold mb-4">综合评价</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <ScoreChip label="内容质量" score={result.dataAnalysis.contentQuality} />
                      <ScoreChip label="标题质量" score={result.dataAnalysis.titleQuality} />
                      {hasData && <ScoreChip label="互动率" score={result.dataAnalysis.engagement} />}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.summary}</p>
                  </div>

                  {/* 亮点 */}
                  {result.strengths.length > 0 && (
                    <div className="zen-card p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs flex items-center justify-center font-bold">✓</span>
                        <p className="text-sm font-semibold">做得好的地方</p>
                      </div>
                      <ul className="space-y-2">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] mt-1.5 flex-shrink-0"/>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 不足 */}
                  {result.weaknesses.length > 0 && (
                    <div className="zen-card p-5 border-[var(--accent-warm)]/20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-5 h-5 rounded-full bg-[var(--accent-warm)]/15 text-[var(--accent-warm)] text-xs flex items-center justify-center font-bold">!</span>
                        <p className="text-sm font-semibold">可以改进的地方</p>
                      </div>
                      <ul className="space-y-2">
                        {result.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-warm)] mt-1.5 flex-shrink-0"/>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 下一篇文章建议 */}
                  <div className="zen-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-5 h-5 rounded-full bg-[var(--accent-primary)] text-white text-xs flex items-center justify-center">→</span>
                      <p className="text-sm font-semibold">下一篇文章具体建议</p>
                    </div>
                    <ul className="space-y-2">
                      {result.nextPostSuggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="text-[var(--accent-primary)] font-medium flex-shrink-0">{i + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 时间和方向 */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="zen-card p-4">
                      <p className="text-xs text-[var(--text-muted)] mb-1">最佳发布时间</p>
                      <p className="text-sm font-medium text-[var(--accent-primary)]">{result.bestPostingTime}</p>
                    </div>
                    <div className="zen-card p-4">
                      <p className="text-xs text-[var(--text-muted)] mb-1">下一个内容方向</p>
                      <p className="text-sm font-medium text-[var(--accent-warm)]">{result.contentDirection}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <a href="/tools/studio" className="zen-btn zen-btn-primary w-full text-center block">
                    根据复盘建议开始创作 →
                  </a>
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
