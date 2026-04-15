'use client';

import { useState, useEffect, useRef } from 'react';
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

type HistoryEntry = {
  id: string;
  input: string;
  mode: OutputMode;
  output: string;
  savedAt: string;
}

// --- localStorage 工具（内联） ---
function lsGet<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : fallback; } catch { return fallback; }
}
function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
function lsRm(key: string) { try { localStorage.removeItem(key); } catch { /* ignore */ } }

const LS_HISTORY = 'zenjing_translate_history';
const LS_DRAFT = 'zenjing_translate_draft';

export default function TranslatePage() {
  const [input, setInput] = useState('');
  const [outputMode, setOutputMode] = useState<OutputMode>('light');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // 历史记录持久化
  const [history, setHistory] = useState<HistoryEntry[]>(() => lsGet<HistoryEntry[]>(LS_HISTORY, []));

  // 自动保存草稿（输入变化时）
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!input.trim()) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem('zenjing_translate_draft', JSON.stringify({
        input,
        mode: outputMode,
        savedAt: new Date().toISOString(),
      }));
      setLastSaved(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [input, outputMode]);

  // 恢复草稿
  useEffect(() => {
    try {
      const raw = localStorage.getItem('zenjing_translate_draft');
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.input && draft.input !== input) {
          setInput(draft.input);
          setOutputMode(draft.mode || 'light');
        }
        if (draft.savedAt) {
          setLastSaved(new Date(draft.savedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const data = await res.json();
      if (!data.result) throw new Error('服务暂不可用，请稍后重试');
      setOutput(data.result);

      // 保存到历史记录
      const entry: HistoryEntry = {
        id: `t_${Date.now()}`,
        input,
        mode: outputMode,
        output: data.result,
        savedAt: new Date().toISOString(),
      };
      setHistory(prev => {
        const next = [entry, ...prev].slice(0, 50);
        lsSet(LS_HISTORY, next);
        return next;
      });

      // 清除草稿
      lsRm(LS_DRAFT);
      setLastSaved(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (entry: HistoryEntry) => {
    setInput(entry.input);
    setOutputMode(entry.mode);
    setOutput(entry.output);
    setShowHistory(false);
  };

  const handleClearDraft = () => {
    lsRm(LS_DRAFT);
    setInput('');
    setOutput('');
    setLastSaved(null);
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
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">法师讲座原文 / 笔记内容</label>
                <div className="flex items-center gap-3">
                  {lastSaved && (
                    <span className="text-xs text-[var(--text-muted)]">草稿已保存 {lastSaved}</span>
                  )}
                  {input && (
                    <button
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
                      onClick={handleClearDraft}
                    >
                      清除草稿
                    </button>
                  )}
                  <button
                    className="text-xs text-[var(--accent-warm)] hover:underline"
                    onClick={() => setShowHistory(v => !v)}
                  >
                    历史记录 {history.length > 0 ? `(${history.length})` : ''}
                  </button>
                </div>
              </div>
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

            {/* History panel */}
            {showHistory && history.length > 0 && (
              <div className="zen-card p-5 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">历史记录</p>
                  <button
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-red)]"
                    onClick={() => { setHistory([]); lsSet(LS_HISTORY, []); }}
                  >
                    清空
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map(entry => (
                    <button
                      key={entry.id}
                      className="w-full text-left p-3 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] hover:bg-[var(--border)] transition-colors"
                      onClick={() => handleRestore(entry)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[var(--accent-warm)]">
                          {OUTPUT_MODES.find(m => m.id === entry.mode)?.name}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {new Date(entry.savedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {entry.input.slice(0, 60)}{entry.input.length > 60 ? '…' : ''}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* Error */}
            {error && (
              <div className="zen-card p-5 border-[var(--accent-red)]/30 bg-[var(--accent-red)]/5">
                <p className="text-sm text-[var(--accent-red)]">{error}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  AI翻译需要配置 DeepSeek API Key。请在 Vercel 环境变量中添加 <code className="bg-[var(--bg-secondary)] px-1 rounded">DEEPSEEK_API_KEY</code>
                </p>
              </div>
            )}

            {/* Output */}
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
