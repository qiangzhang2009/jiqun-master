'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type DiagnoseResult = {
  clarity: number;
  warmth: number;
  differentiation: number;
  overall: string;
  clarityAdvice: string[];
  warmthAdvice: string[];
  diffAdvice: string[];
  quickWins?: string[];
  recommendedTags?: string[];
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const level = score >= 80 ? '优秀' : score >= 60 ? '良好' : score >= 40 ? '一般' : '需重塑';
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-[var(--text-muted)]">{level}</span>
        </div>
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
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [contentType, setContentType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [postsPerWeek, setPostsPerWeek] = useState('1~2');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  const handleDiagnose = async () => {
    if (!accountType || !contentType || !targetAudience) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName, accountType, contentType, targetAudience, postsPerWeek, goal }),
      });

      const data = await res.json();
      if (!res.ok || !data.result) throw new Error(data.error || '诊断服务暂不可用');
      setResult(data.result);
      setUsingFallback(!!data.usingFallback);
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
                <label className="block text-sm font-medium mb-2">账号名称（选填）</label>
                <input
                  className="zen-input"
                  placeholder="例如：静心小院、智慧人生"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">账号类型 <span className="text-[var(--accent-red)]">*</span></label>
                <select className="zen-input" value={accountType} onChange={e => setAccountType(e.target.value)}>
                  <option value="">请选择</option>
                  <option value="法师/僧人">法师/僧人（本人出镜）</option>
                  <option value="禅修道场/寺院">禅修道场/寺院（官方账号）</option>
                  <option value="居士/义工">居士/义工（个人账号）</option>
                  <option value="读书会/共修小组">读书会/共修小组</option>
                  <option value="传统文化/心灵成长">传统文化/心灵成长类</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">内容形式 <span className="text-[var(--accent-red)]">*</span></label>
                <select className="zen-input" value={contentType} onChange={e => setContentType(e.target.value)}>
                  <option value="">请选择</option>
                  <option value="讲座视频">法师讲座/课程视频</option>
                  <option value="图文笔记">图文笔记（读书心得等）</option>
                  <option value="金句图文">金句图文（配图+文字）</option>
                  <option value="修行生活">修行生活记录（vlog/图文）</option>
                  <option value="混排">多种形式混合</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">目标受众 <span className="text-[var(--accent-red)]">*</span></label>
                <input
                  className="zen-input"
                  placeholder="例如：25~40岁焦虑的年轻人、职场高压人群"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">发布频率</label>
                <select className="zen-input" value={postsPerWeek} onChange={e => setPostsPerWeek(e.target.value)}>
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
                  placeholder="例如：让更多年轻人接触到正统佛法，让禅修走进千家万户的日常生活"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                {accountType && contentType && targetAudience ? '✓ 信息已填全，可以开始诊断' : '请至少填写带 * 的三个字段'}
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
              <p className="text-xs text-[var(--text-muted)] mt-1">请检查 DeepSeek API Key 是否已配置到 Vercel 环境变量中</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="animate-fade-in">
              {usingFallback && (
                <div className="zen-card p-4 mb-5 border-[var(--accent-warm)]/30 bg-[var(--accent-warm)]/5">
                  <p className="text-xs text-[var(--accent-warm)]">
                    当前使用基础规则引擎诊断。配置 DeepSeek API Key 可获得 AI 深度诊断。
                  </p>
                </div>
              )}

              {/* Quick wins */}
              {result.quickWins && result.quickWins.length > 0 && (
                <div className="zen-card p-5 mb-5 border-l-4 border-l-[var(--accent-warm)]">
                  <p className="text-xs font-medium text-[var(--accent-warm)] mb-3">⚡ 立刻能做的快速见效行动</p>
                  <div className="flex flex-wrap gap-2">
                    {result.quickWins.map((w, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-[var(--accent-warm)]/10 text-[var(--accent-warm)] text-sm">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Three scores */}
              <div className="zen-card p-6 mb-5">
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

              {/* Three advice columns */}
              <div className="grid sm:grid-cols-3 gap-5 mb-5">
                {[
                  { label: '定位建议', color: 'var(--accent-primary)', advice: result.clarityAdvice },
                  { label: '人设建议', color: 'var(--accent-warm)', advice: result.warmAdvice },
                  { label: '差异化建议', color: '#8B7355', advice: result.diffAdvice },
                ].map(({ label, color, advice }) => (
                  <div key={label} className="zen-card p-5">
                    <p className="text-sm font-semibold mb-4" style={{ color }}>{label}</p>
                    <ul className="space-y-2">
                      {advice.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                          <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }}/>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Recommended tags */}
              {result.recommendedTags && result.recommendedTags.length > 0 && (
                <div className="zen-card p-5 mb-5">
                  <p className="text-sm font-semibold mb-3">推荐标签</p>
                  <div className="flex flex-wrap gap-2">
                    {result.recommendedTags.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA to studio */}
              <div className="zen-card p-5 border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5">
                <p className="text-sm font-medium mb-2">诊断完成后，开始创作</p>
                <p className="text-xs text-[var(--text-muted)] mb-4">使用创作工作台，从素材采集到发布一气呵成</p>
                <a href="/tools/studio" className="zen-btn zen-btn-primary inline-flex items-center gap-2">
                  打开创作工作台
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
