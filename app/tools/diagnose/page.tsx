'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type DiagnoseResult = {
  clarity: number;
  warmth: number;
  differentiation: number;
  clarityAdvice: string[];
  warmthAdvice: string[];
  diffAdvice: string[];
  overall: string;
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function DiagnosePage() {
  const [accountType, setAccountType] = useState('');
  const [contentType, setContentType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [postsPerWeek, setPostsPerWeek] = useState('1~2');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDiagnose = async () => {
    if (!accountType || !contentType || !targetAudience) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType, contentType, targetAudience, postsPerWeek, goal }),
      });

      if (!res.ok) throw new Error('诊断服务暂不可用');
      const data = await res.json();
      setResult(data.result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/12 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">观己 · 账号诊断</h1>
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[var(--accent-warm)]/12 text-[var(--accent-warm)] font-medium">AI</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">输入账号基本信息，AI给出三维诊断报告和优化建议</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Form */}
          <div className="zen-card p-6 mb-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">账号类型</label>
                <select
                  className="zen-input"
                  value={accountType}
                  onChange={e => setAccountType(e.target.value)}
                >
                  <option value="">请选择</option>
                  <option value="法师/僧人">法师/僧人（本人出镜）</option>
                  <option value="居士/义工">居士/义工（个人账号）</option>
                  <option value="机构/道场">机构/道场（官方账号）</option>
                  <option value="读书会/研学小组">读书会/研学小组</option>
                  <option value="传统文化类">传统文化/心灵成长类</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">内容形式</label>
                <select
                  className="zen-input"
                  value={contentType}
                  onChange={e => setContentType(e.target.value)}
                >
                  <option value="">请选择</option>
                  <option value="讲座视频">讲座/课程视频</option>
                  <option value="图文笔记">图文笔记（读书心得等）</option>
                  <option value="金句图文">金句图文（配图+文字）</option>
                  <option value="生活记录">修行生活记录</option>
                  <option value="混排">多种形式混合</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">目标受众</label>
                <input
                  className="zen-input"
                  placeholder="例如：25~40岁焦虑的年轻人"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">发布频率</label>
                <select
                  className="zen-input"
                  value={postsPerWeek}
                  onChange={e => setPostsPerWeek(e.target.value)}
                >
                  <option value="不足1篇">不足1篇/周</option>
                  <option value="1~2">1~2篇/周</option>
                  <option value="3~5">3~5篇/周</option>
                  <option value="5篇以上">5篇以上/周</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">运营目标（选填）</label>
                <input
                  className="zen-input"
                  placeholder="例如：让更多年轻人接触到正统佛法，找到志同道合的修行伙伴"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                {accountType && contentType && targetAudience ? '信息已填全，可以开始诊断' : '请至少填写前三个字段'}
              </p>
              <button
                className="zen-btn zen-btn-primary"
                onClick={handleDiagnose}
                disabled={!accountType || !contentType || !targetAudience || loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
                    </svg>
                    诊断中…
                  </>
                ) : '开始诊断'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="zen-card p-5 border-[var(--accent-red)]/30 bg-[var(--accent-red)]/5 mb-6">
              <p className="text-sm text-[var(--accent-red)]">{error}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                AI诊断需要配置 OpenAI API Key。
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="animate-fade-in">
              <div className="zen-card p-6 mb-6">
                <h2 className="font-serif text-lg font-semibold mb-5">诊断报告</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                  <ScoreBar label="定位清晰度" score={result.clarity} color="var(--accent-primary)" />
                  <ScoreBar label="人设温度" score={result.warmth} color="var(--accent-warm)" />
                  <ScoreBar label="差异化指数" score={result.differentiation} color="#8B7355" />
                </div>

                {result.overall && (
                  <div className="mt-4 p-4 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]">
                    <p className="text-sm font-medium mb-1">综合评价</p>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.overall}</p>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  { label: '定位建议', score: result.clarity, advice: result.clarityAdvice },
                  { label: '人设建议', score: result.warmth, advice: result.warmAdvice },
                  { label: '差异化建议', score: result.differentiation, advice: result.diffAdvice },
                ].map(({ label, advice }) => (
                  <div key={label} className="zen-card p-5">
                    <p className="text-sm font-semibold mb-4">{label}</p>
                    <ul className="space-y-2">
                      {advice.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] flex-shrink-0"/>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
