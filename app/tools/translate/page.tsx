'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type OutputMode = 'light' | 'gold' | 'expand';

const OUTPUT_MODES: { id: OutputMode; name: string; desc: string }[] = [
  { id: 'light', name: '轻量笔记', desc: '200~400字小红书图文，保留核心观点' },
  { id: 'gold', name: '金句图文', desc: '提取3~5条精华金句，适合「墨境」直接使用' },
  { id: 'expand', name: '选题扩展', desc: '从一段内容中提取3个可独立成篇的选题' },
];

const EXAMPLE_TEXTS = [
  `《金刚经》说：「凡所有相，皆是虚妄。若见诸相非相，即见如来。」这句话告诉我们，世间一切显现都是因缘和合而生，没有永恒不变的实体。我们执着于财富、地位、感情，就是因为把它们当成了真实永恒的东西。当我们认识到一切皆空，不是说什么都不存在，而是认识到事物没有自性，这样才能不被外相所束缚，获得真正的自在。`,
  `很多人学佛多年，依然烦恼重重。问题出在哪里？出在把学佛当成了一种新的执着——执着于读经的数量、禅坐的时间、供灯的次数。真正的修行不是积累功德，而是改变心行。当我们学会用无常的眼光看待一切，用缘起的智慧面对问题，那才是真正的开始。修行不在形式，在心。`,
  `法师在讲座中提到：现代人最大的痛苦，不是物质匮乏，而是精神空虚。我们拼命向外追逐，以为得到更多就会快乐。但佛法告诉我们，快乐来自内心，不是来自外在。当我们学会向内观照，减少对外界的依赖，才能获得真正的安宁。这不是消极避世，而是一种更有智慧的生活方式。`,
];

function copyText(text: string) {
  navigator.clipboard.writeText(text);
}

export default function TranslatePage() {
  const [input, setInput] = useState('');
  const [outputMode, setOutputMode] = useState<OutputMode>('light');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput('');
    setError('');

    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, mode: outputMode }),
      });

      if (!res.ok) throw new Error('服务暂不可用，请稍后重试');

      const data = await res.json();
      setOutput(data.result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-warm)]/12 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/>
                  <path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">转语 · 内容翻译</h1>
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[var(--accent-warm)]/12 text-[var(--accent-warm)] font-medium">AI</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">将法师讲座内容翻译成小红书用户能理解的语言，保留佛法精髓</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid gap-6">
            {/* Input */}
            <div className="zen-card p-6">
              <label className="block text-sm font-medium mb-3">法师讲座原文 / 笔记内容</label>
              <textarea
                className="zen-textarea h-48"
                placeholder="粘贴法师讲座原文、读书会记录、笔记内容……\n\n系统会自动保留佛法核心观点，将学术表达转化为小红书风格。"
                value={input}
                onChange={e => setInput(e.target.value)}
              />

              <div className="mt-4">
                <label className="block text-sm font-medium mb-3">输出模式</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {OUTPUT_MODES.map(mode => (
                    <button
                      key={mode.id}
                      className={`p-4 rounded-[var(--radius-sm)] border text-left transition-all ${
                        outputMode === mode.id
                          ? 'border-[var(--accent-warm)] bg-[var(--accent-warm)]/8'
                          : 'border-[var(--border)] hover:border-[var(--accent-light)]'
                      }`}
                      onClick={() => setOutputMode(mode.id)}
                    >
                      <p className={`text-sm font-medium ${outputMode === mode.id ? 'text-[var(--accent-warm)]' : ''}`}>
                        {mode.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">{input.length} 字</span>
                <button
                  className="zen-btn zen-btn-primary"
                  onClick={handleGenerate}
                  disabled={!input.trim() || loading}
                  style={{ background: 'var(--accent-warm)', opacity: (!input.trim() || loading) ? 0.6 : 1 }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
                      </svg>
                      翻译中…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M22 22l-5-10-5 10"/>
                      </svg>
                      开始翻译
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Example texts */}
            <div className="zen-card p-5">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">快速测试示例</p>
              <div className="space-y-2">
                {EXAMPLE_TEXTS.map((t, i) => (
                  <button
                    key={i}
                    className="w-full text-left text-xs px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors"
                    onClick={() => setInput(t)}
                  >
                    {t.slice(0, 80)}…
                  </button>
                ))}
              </div>
            </div>

            {/* Output */}
            {error && (
              <div className="zen-card p-5 border-[var(--accent-red)]/30 bg-[var(--accent-red)]/5">
                <p className="text-sm text-[var(--accent-red)]">{error}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  AI翻译需要配置 OpenAI API Key。请在项目根目录创建 .env.local 文件，添加 <code className="bg-[var(--bg-secondary)] px-1 rounded">OPENAI_API_KEY=你的密钥</code>
                </p>
              </div>
            )}

            {output && (
              <div className="zen-card p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-sm font-medium">翻译结果</span>
                  </div>
                  <button
                    className="zen-btn zen-btn-ghost text-xs"
                    onClick={() => { copyText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  >
                    {copied ? '已复制' : '复制全文'}
                  </button>
                </div>
                <div className="zen-prose whitespace-pre-wrap">{output}</div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
