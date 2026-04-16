'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// ─── 步骤定义 ───
type Step = 'collect' | 'translate' | 'titles' | 'tags' | 'poster' | 'check' | 'final';
type OutputMode = 'light' | 'gold' | 'expand';

const STEPS: { id: Step; label: string }[] = [
  { id: 'collect', label: '素材采集' },
  { id: 'translate', label: 'AI转语' },
  { id: 'titles', label: '爆款标题' },
  { id: 'tags', label: '智能标签' },
  { id: 'poster', label: '封面图' },
  { id: 'check', label: '合规检测' },
  { id: 'final', label: '生成终稿' },
];

const STEP_ORDER = STEPS.map(s => s.id);

// ─── 录音状态 ───
type RecordingState = 'idle' | 'recording' | 'processing';

function TranscriptStudio() {
  // ── 共享内容状态 ──
  const [sourceText, setSourceText] = useState('');       // 原始素材
  const [translatedText, setTranslatedText] = useState(''); // 翻译结果
  const [titles, setTitles] = useState<string[]>([]);      // 标题列表
  const [selectedTitle, setSelectedTitle] = useState('');   // 选中的标题
  const [tags, setTags] = useState<string[]>([]);          // 标签列表
  const [posterQuote, setPosterQuote] = useState('');       // 封面金句
  const [checkResult, setCheckResult] = useState<{ score: number; issues: Array<{ word: string; replacement?: string }> } | null>(null);
  const [checkText, setCheckText] = useState('');           // 待检测文本
  const [finalDraft, setFinalDraft] = useState('');          // 终稿
  const [finalLoading, setFinalLoading] = useState(false);   // 终稿生成中
  const [xhsUrl, setXhsUrl] = useState('');                // 小红书URL输入
  const [xhsScraping, setXhsScraping] = useState(false);   // 抓取中
  const [xhsError, setXhsError] = useState('');            // 抓取错误
  const [xhsSuccess, setXhsSuccess] = useState('');       // 抓取成功提示
  const [finalError, setFinalError] = useState('');       // 终稿生成错误

  // ── 步骤导航 ──
  const [currentStep, setCurrentStep] = useState<Step>('collect');

  // ── 各步骤状态 ──
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');
  const [translatingMode, setTranslatingMode] = useState<OutputMode>('light');
  const [generatingTitles, setGeneratingTitles] = useState(false);
  const [titleTopic, setTitleTopic] = useState('');
  const [generatingTags, setGeneratingTags] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  // ── 录音状态 ──
  const [recording, setRecording] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── 快捷示例素材 ──
  const SAMPLE_MATERIALS = [
    { label: '法师讲座', text: '法师开示：现代人最大的问题，是把向外追逐当成快乐之源。我们以为得到更多就会更幸福，却不知道真正的安宁，来自内心。修行不是积累功德，而是改变心行。当你学会向内观照，减少对外界的依赖，才真正开始了觉醒之路。' },
    { label: '禅修记录', text: '今日打坐，静坐时妄念如流水不断。但慢慢发现，自己不必去抓住每一个念头，也不必去赶走它们。就像坐在河边，看水从身边流过，不迎不拒。一个小时的静坐，让我体会到什么是真正的放松。' },
    { label: '读书心得', text: '读《金刚经》笔记：「凡所有相，皆是虚妄」——世间一切显现都是因缘和合，没有永恒不变的实体。我们执着于财富、感情，就是因为把它们当成了真实永恒的。当我们认识到一切皆空，反而能更自在地生活。' },
  ];

  // ── 素材采集：语音识别 ──
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRef.current = mediaRecorder;

      const SpeechRecognitionAPI = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        alert('您的浏览器不支持语音识别，建议使用 Chrome 浏览器');
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      let fullTranscript = '';
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            fullTranscript += t;
          } else {
            interim += t;
          }
        }
        setTranscript(fullTranscript + interim);
      };

      recognition.onerror = () => {
        stopRecording();
      };

      recognition.onend = () => {
        if (recording === 'recording') {
          setTranscript(prev => prev);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      mediaRecorder.start();

      setRecording('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch {
      alert('无法访问麦克风，请检查浏览器权限设置');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    mediaRef.current?.stream.getTracks().forEach(t => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording('idle');
    if (transcript.trim()) {
      setSourceText(prev => prev + (prev ? '\n\n' : '') + transcript.trim());
      setTranscript('');
    }
  }, [transcript]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      mediaRef.current?.stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── 跳转到工作台顶部 ──
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (step: Step) => {
    setCurrentStep(step);
    scrollToTop();
  };

  const canAccessStep = (step: Step): boolean => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx === 0) return true;
    const prevStep = STEP_ORDER[idx - 1];
    if (prevStep === 'collect') return sourceText.trim().length > 0;
    if (prevStep === 'translate') return sourceText.trim().length > 0;
    if (prevStep === 'titles') return translatedText.trim().length > 0;
    if (prevStep === 'tags') return selectedTitle.trim().length > 0 || translatedText.trim().length > 0;
    if (prevStep === 'poster') return selectedTitle.trim().length > 0 || translatedText.trim().length > 0;
    if (prevStep === 'check') return true;
    if (prevStep === 'final') return checkResult !== null;
    return false;
  };

  // ── AI 翻译 ──
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setTranslating(true);
    setTranslateError('');
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, mode: translatingMode }),
      });
      const data = await res.json();
      if (!data.result) throw new Error(data.error || '翻译失败');
      setTranslatedText(data.result);
      // 自动跳到下一步
      const nextIdx = STEP_ORDER.indexOf('translate') + 1;
      if (nextIdx < STEP_ORDER.length) goToStep(STEP_ORDER[nextIdx]);
    } catch (err: unknown) {
      setTranslateError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setTranslating(false);
    }
  };

  // ── 生成标题 ──
  const handleGenerateTitles = async () => {
    const topic = translatedText || sourceText;
    if (!topic.trim()) return;
    setGeneratingTitles(true);
    setTitleTopic(topic);
    try {
      const res = await fetch('/api/ai/title', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic }) });
      const data = await res.json();
      if (data.titles && Array.isArray(data.titles)) {
        setTitles(data.titles);
        if (data.titles[0]) setSelectedTitle(data.titles[0]);
        // 自动前进到下一步
        setTimeout(() => goToStep('tags'), 100);
      }
    } catch { /* ignore */ } finally {
      setGeneratingTitles(false);
    }
  };

  // ── 生成标签 ──
  const handleGenerateTags = async () => {
    const content = selectedTitle || translatedText || sourceText;
    if (!content.trim()) return;
    setGeneratingTags(true);
    try {
      const res = await fetch('/api/ai/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) });
      const data = await res.json();
      if (data.tags && Array.isArray(data.tags)) setTags(data.tags);
      // 自动前进到封面图
      if (data.tags?.length > 0) setTimeout(() => goToStep('poster'), 100);
    } catch { /* ignore */ } finally {
      setGeneratingTags(false);
    }
  };

  // ── 本地违禁词检测 ──
  const handleCheck = useCallback(() => {
    const textToCheck = checkText || selectedTitle + '\n' + translatedText;
    if (!textToCheck.trim()) return;
    setCheckLoading(true);

    import('@/lib/rules/prohibited-words').then(({ categories }) => {
      const lower = textToCheck.toLowerCase();
      const issues: Array<{ word: string; replacement?: string }> = [];
      for (const category of categories) {
        for (const item of category.words) {
          if (lower.includes(item.word.toLowerCase())) {
            issues.push({ word: item.word, replacement: item.replacement });
          }
        }
      }
      const score = Math.max(0, 100 - issues.length * 7);
      setCheckResult({ score, issues });
      setCheckLoading(false);
    });
  }, [checkText, selectedTitle, translatedText]);

  // ── 小红书URL抓取 ──
  const handleScrapeXHS = async () => {
    if (!xhsUrl.trim()) return;
    setXhsScraping(true);
    setXhsError('');
    try {
      const res = await fetch('/api/xhs/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: xhsUrl }),
      });
      const data = await res.json();
      if (!data.success) {
        setXhsError(data.hint || data.error || '抓取失败');
        return;
      }
      // 自动将抓取内容填入素材框
      const newMaterial = data.material || data.data?.content || '';
      setSourceText(prev => {
        const separator = prev.trim() ? '\n\n---\n\n' : '';
        return prev + separator + newMaterial;
      });
      setXhsUrl('');
      setXhsError('');
      // 成功提示
      if (data.type === 'profile' && data.noteCount) {
        setXhsSuccess(`✓ 已从主页提取 ${data.noteCount} 篇笔记，自动填入素材框`);
      } else {
        setXhsSuccess('✓ 笔记内容已自动填入下方素材框');
      }
      setTimeout(() => setXhsSuccess(''), 5000);
      // 滚动到素材输入框
      const textarea = window.document.querySelector('textarea[placeholder*="粘贴法师"]') as HTMLTextAreaElement | null;
      if (textarea) textarea.focus();
    } catch {
      setXhsError('网络错误，请检查网络连接后重试');
    } finally {
      setXhsScraping(false);
    }
  };

  // ── 生成终稿 ──
  const handleGenerateFinal = async () => {
    if (!selectedTitle && !translatedText) return;
    setFinalLoading(true);
    try {
      const res = await fetch('/api/ai/final-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: selectedTitle, body: translatedText, tags, posterQuote: posterQuote || selectedTitle }),
      });
      const data = await res.json();
      if (data.error) {
        setFinalError(data.error);
        return;
      }
      if (data.result) {
        setFinalDraft(data.result);
        const nextIdx = STEP_ORDER.indexOf('final') + 1;
        if (nextIdx < STEP_ORDER.length) goToStep(STEP_ORDER[nextIdx]);
      }
    } catch {
      setFinalError('生成失败，请稍后重试');
    } finally {
      setFinalLoading(false);
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── 步骤进度计算 ──
  const completedSteps: Step[] = [];
  if (sourceText.trim()) completedSteps.push('collect');
  if (translatedText.trim()) completedSteps.push('translate');
  if (selectedTitle.trim()) completedSteps.push('titles');
  if (tags.length > 0) completedSteps.push('tags');
  if (posterQuote.trim()) completedSteps.push('poster');
  if (checkResult && checkResult.issues.length === 0) completedSteps.push('check');
  if (finalDraft.trim()) completedSteps.push('final');

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ── 顶部标题 ── */}
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/12 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">创作工作台</h1>
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] font-medium">AI</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">从素材采集到封面图，一站式完成禅修内容创作全流程</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* ── 步骤导航条 ── */}
          <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
            {STEPS.map((step, i) => {
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.includes(step.id);
              const canAccess = canAccessStep(step.id);
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => canAccess && goToStep(step.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[var(--accent-primary)] text-white shadow-md'
                        : isCompleted
                        ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] cursor-pointer'
                        : canAccess
                        ? 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] cursor-pointer'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : isCompleted ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'
                    }`}>
                      {isCompleted ? '✓' : i + 1}
                    </span>
                    {step.label}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-6 h-px mx-1 ${isCompleted ? 'bg-[var(--accent-primary)]/30' : 'bg-[var(--border)]'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── 步骤1：素材采集 ── */}
          {currentStep === 'collect' && (
            <div className="animate-fade-in space-y-6">
              {/* 小红书URL采集 */}
              <div className="zen-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded bg-[#FF4D4F] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">红</span>
                  </div>
                  <h3 className="text-sm font-semibold">小红书内容采集</h3>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    className="zen-input flex-1"
                    placeholder="粘贴小红书主页链接（/user/profile/）或笔记链接（/discovery/item/）"
                    value={xhsUrl}
                    onChange={e => setXhsUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleScrapeXHS()}
                  />
                  <button
                    className="zen-btn zen-btn-primary flex-shrink-0"
                    onClick={handleScrapeXHS}
                    disabled={xhsScraping || !xhsUrl.trim()}
                  >
                    {xhsScraping ? (
                      <><svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>提取中…</>
                    ) : '提取内容'}
                  </button>
                </div>

                {/* 成功提示 */}
                {xhsSuccess && (
                  <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/8 border border-[var(--accent-primary)]/20 mb-3">
                    <p className="text-sm text-[var(--accent-primary)] font-medium">{xhsSuccess}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">内容已自动填入下方素材框，滚动查看</p>
                  </div>
                )}

                {/* 错误提示 */}
                {xhsError && (
                  <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--accent-warm)]/8 border border-[var(--accent-warm)]/20 mb-3">
                    <p className="text-sm text-[var(--accent-warm)]">{xhsError}</p>
                  </div>
                )}

                <p className="text-xs text-[var(--text-muted)]">
                  <strong>支持两种链接：</strong>
                  ① 用户主页（/user/profile/）— 自动提取多篇笔记
                  ② 单篇笔记（/discovery/item/）— 提取单篇内容
                </p>

                {/* 浏览器提取引导 */}
                <div className="mt-3 pt-3 border-t border-[var(--border-light)]">
                  <div className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]">
                    <svg className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--text-secondary)]">
                        如果自动提取失败（小红书有反爬限制），推荐使用
                        <a href="/tools/extract" className="text-[var(--accent-primary)] font-medium hover:underline ml-1">
                          浏览器提取工具 →
                        </a>
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">用浏览器书签一键提取你登录后看到的所有笔记，无需手动复制</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="zen-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-lg font-semibold">素材输入</h2>
                  <div className="flex items-center gap-3">
                    {recording === 'recording' && (
                      <div className="flex items-center gap-2 text-[var(--accent-red)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-red)] animate-pulse"/>
                        <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                      </div>
                    )}
                    {recording === 'recording' ? (
                      <button className="zen-btn zen-btn-secondary" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }} onClick={stopRecording}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent-red)" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                        停止录音
                      </button>
                    ) : (
                      <button className="zen-btn zen-btn-secondary" onClick={startRecording}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>
                        开始录音
                      </button>
                    )}
                  </div>
                </div>

                {/* 录音转写预览 */}
                {transcript && (
                  <div className="mb-4 p-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20">
                    <p className="text-xs text-[var(--accent-primary)] mb-1 font-medium">实时转写</p>
                    <p className="text-sm text-[var(--text-secondary)]">{transcript}</p>
                  </div>
                )}

                <textarea
                  className="zen-textarea h-52"
                  placeholder={"粘贴法师讲座原文、禅修记录、读书笔记，或使用上方录音功能实时转写……\n\n抓取的笔记内容也会自动填入此处"}
                  value={sourceText}
                  onChange={e => setSourceText(e.target.value)}
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">{sourceText.length} 字</span>
                  {sourceText.trim() && (
                    <button className="zen-btn zen-btn-primary" onClick={() => goToStep('translate')}>
                      素材就绪，开始创作
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  )}
                </div>

                {/* 快捷示例 */}
                <div className="mt-6 pt-5 border-t border-[var(--border-light)]">
                  <p className="text-xs text-[var(--text-muted)] mb-3">快捷素材示例（点击填入）</p>
                  <div className="space-y-2">
                    {SAMPLE_MATERIALS.map((m, i) => (
                      <button
                        key={i}
                        className="w-full text-left text-xs px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] transition-colors"
                        onClick={() => setSourceText(m.text)}
                      >
                        <span className="text-[var(--accent-primary)] mr-2">[{m.label}]</span>
                        {m.text.slice(0, 60)}…
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 步骤2：AI转语 ── */}
          {currentStep === 'translate' && (
            <div className="animate-fade-in space-y-6">
              {/* 来源摘要 */}
              <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] border border-[var(--border-light)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">原始素材</p>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{sourceText}</p>
                <button className="text-xs text-[var(--accent-primary)] mt-1 hover:underline" onClick={() => goToStep('collect')}>返回修改</button>
              </div>

              <div className="zen-card p-6">
                <h2 className="font-serif text-lg font-semibold mb-4">AI 内容翻译</h2>
                <div className="grid sm:grid-cols-3 gap-3 mb-5">
                  {([
                    { id: 'light', name: '轻量笔记', desc: '200~400字图文' },
                    { id: 'gold', name: '金句图文', desc: '提取精华金句' },
                    { id: 'expand', name: '选题扩展', desc: '3个可成篇选题' },
                  ] as const).map(mode => (
                    <button
                      key={mode.id}
                      className={`p-4 rounded-[var(--radius-sm)] border text-left transition-all ${
                        translatingMode === mode.id ? 'border-[var(--accent-warm)] bg-[var(--accent-warm)]/8' : 'border-[var(--border)] hover:border-[var(--accent-light)]'
                      }`}
                      onClick={() => setTranslatingMode(mode.id)}
                    >
                      <p className={`text-sm font-medium ${translatingMode === mode.id ? 'text-[var(--accent-warm)]' : ''}`}>{mode.name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{mode.desc}</p>
                    </button>
                  ))}
                </div>

                <button
                  className="zen-btn zen-btn-primary w-full"
                  onClick={handleTranslate}
                  disabled={!sourceText.trim() || translating}
                  style={{ background: 'var(--accent-warm)', opacity: (!sourceText.trim() || translating) ? 0.6 : 1 }}
                >
                  {translating ? (
                    <><svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>翻译中…</>
                  ) : '开始翻译 →'}
                </button>

                {translateError && (
                  <div className="mt-4 p-4 rounded-[var(--radius-sm)] bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20">
                    <p className="text-sm text-[var(--accent-red)]">{translateError}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">请检查 DeepSeek API Key 是否已正确配置在 Vercel 环境变量中</p>
                  </div>
                )}
              </div>

              {/* 翻译结果 */}
              {translatedText && (
                <div className="zen-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-semibold">翻译结果</h3>
                    <button className="zen-btn zen-btn-ghost text-xs" onClick={() => { navigator.clipboard.writeText(translatedText); }}>
                      复制全文
                    </button>
                  </div>
                  <div className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">{translatedText}</div>
                  <div className="mt-4 flex items-center gap-3">
                    <button className="zen-btn zen-btn-primary" onClick={() => goToStep('titles')}>
                      生成标题 →
                    </button>
                    <button className="zen-btn zen-btn-ghost text-xs" onClick={() => setTranslatedText('')}>
                      重新翻译
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 步骤3：爆款标题 ── */}
          {currentStep === 'titles' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-3">
                <button className="zen-btn zen-btn-ghost text-xs" onClick={() => goToStep('translate')}>
                  ← 上一步
                </button>
              </div>

              {translatedText && (
                <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] border border-[var(--border-light)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">翻译结果摘要</p>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{translatedText}</p>
                </div>
              )}

              <div className="zen-card p-6">
                <h2 className="font-serif text-lg font-semibold mb-2">爆款标题生成</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-5">基于内容生成15个备选标题，包含悬疑式、痛点式、数字冲击、身份代入、情绪共鸣五种类型</p>
                <button
                  className="zen-btn zen-btn-primary w-full"
                  onClick={handleGenerateTitles}
                  disabled={generatingTitles || (!sourceText.trim() && !translatedText.trim())}
                  style={{ opacity: (generatingTitles || (!sourceText.trim() && !translatedText.trim())) ? 0.6 : 1 }}
                >
                  {generatingTitles ? (
                    <><svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>生成中…</>
                  ) : '🎯 生成15个标题'}
                </button>

                {(!sourceText.trim() && !translatedText.trim()) && (
                  <p className="text-xs text-[var(--text-muted)] mt-3 text-center">请先在步骤1填写素材，或在步骤2生成翻译结果</p>
                )}
              </div>

              {titles.length > 0 && (
                <div className="zen-card p-6">
                  <h3 className="font-serif font-semibold mb-4">备选标题（点击选中）</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {titles.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedTitle(t); setPosterQuote(t); }}
                        className={`p-4 rounded-[var(--radius-sm)] border text-left transition-all ${
                          selectedTitle === t
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/8'
                            : 'border-[var(--border)] hover:border-[var(--accent-light)]'
                        }`}
                      >
                        <span className="text-xs text-[var(--text-muted)] mr-2">{i + 1}.</span>
                        <span className="text-sm">{t}</span>
                        {selectedTitle === t && (
                          <span className="ml-auto text-[var(--accent-primary)] text-xs">已选</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <button className="zen-btn zen-btn-primary" onClick={() => goToStep('tags')} disabled={!selectedTitle}>
                      生成标签 →
                    </button>
                    <button className="zen-btn zen-btn-ghost text-xs" onClick={() => { setTitles([]); setSelectedTitle(''); }}>
                      重新生成
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 步骤4：智能标签 ── */}
          {currentStep === 'tags' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-3">
                <button className="zen-btn zen-btn-ghost text-xs" onClick={() => goToStep('titles')}>
                  ← 上一步
                </button>
              </div>

              <div className="zen-card p-6">
                <h2 className="font-serif text-lg font-semibold mb-2">智能标签推荐</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-5">基于标题和内容，AI 推荐核心标签 + 长尾标签组合</p>
                <button
                  className="zen-btn zen-btn-primary w-full"
                  onClick={handleGenerateTags}
                  disabled={generatingTags || (!selectedTitle && !translatedText && !sourceText)}
                  style={{ opacity: (generatingTags || (!selectedTitle && !translatedText && !sourceText)) ? 0.6 : 1 }}
                >
                  {generatingTags ? (
                    <><svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>分析中…</>
                  ) : '🏷️ 生成标签组合'}
                </button>
                {(!selectedTitle && !translatedText && !sourceText) && (
                  <p className="text-xs text-[var(--text-muted)] mt-3 text-center">请先完成素材采集和翻译</p>
                )}

                {tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="zen-btn zen-btn-ghost text-xs" onClick={() => { navigator.clipboard.writeText(tags.join(' ')); }}>
                      复制全部标签
                    </button>
                  </div>
                )}
              </div>

              {/* 常用标签快速添加 */}
              <div className="zen-card p-5">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-3">常用标签快速添加</p>
                <div className="flex flex-wrap gap-2">
                  {['#佛法', '#禅修', '#心灵成长', '#正念', '#修行', '#智慧人生', '#自我觉察', '#内心平静', '#活在当下', '#情绪管理', '#觉悟', '#放下'].map(tag => (
                    <button
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors"
                      onClick={() => {
                        if (!tags.includes(tag)) setTags(prev => [...prev, tag]);
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="zen-btn zen-btn-primary" onClick={() => goToStep('poster')}>
                  生成封面图 →
                </button>
                <button className="zen-btn zen-btn-secondary" onClick={() => goToStep('check')}>
                  跳过封面图 →
                </button>
              </div>
            </div>
          )}

          {/* ── 步骤5：封面图 ── */}
          {currentStep === 'poster' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-3">
                <button className="zen-btn zen-btn-ghost text-xs" onClick={() => goToStep('tags')}>
                  ← 上一步
                </button>
              </div>

              <div className="zen-card p-6">
                <h2 className="font-serif text-lg font-semibold mb-2">封面金句</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-3">从选中的标题或翻译内容中提取，或手动输入封面金句</p>
                <textarea
                  className="zen-textarea h-24"
                  placeholder="自动使用选中的标题，或手动输入金句（建议15~40字）"
                  value={posterQuote || selectedTitle}
                  onChange={e => setPosterQuote(e.target.value)}
                />
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <a
                    href={`/tools/poster`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="zen-btn zen-btn-primary"
                  >
                    🎨 前往墨境生成封面图
                  </a>
                  {(posterQuote || selectedTitle) && (
                    <button className="zen-btn zen-btn-ghost text-xs" onClick={() => navigator.clipboard.writeText(posterQuote || selectedTitle)}>
                      复制金句
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="zen-btn zen-btn-primary" onClick={() => goToStep('check')}>
                  合规检测 →
                </button>
                <button className="zen-btn zen-btn-secondary" onClick={() => goToStep('check')}>
                  跳过封面图
                </button>
              </div>
            </div>
          )}

          {/* ── 步骤6：合规检测 ── */}
          {currentStep === 'check' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-3">
                <button className="zen-btn zen-btn-ghost text-xs" onClick={() => goToStep('poster')}>
                  ← 上一步
                </button>
              </div>

              <div className="zen-card p-6">
                <h2 className="font-serif text-lg font-semibold mb-2">合规检测</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">检测标题和正文中的违禁词，降低限流风险</p>
                <div className="mb-4">
                  <label className="block text-xs text-[var(--text-muted)] mb-2">待检测文本</label>
                  <textarea
                    className="zen-textarea h-32"
                    placeholder="将标题和正文粘贴至此进行检测……"
                    value={checkText || (selectedTitle ? selectedTitle + (translatedText ? '\n\n' + translatedText.slice(0, 300) : '') : translatedText ? translatedText.slice(0, 300) : '')}
                    onChange={e => setCheckText(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    className="zen-btn zen-btn-primary"
                    onClick={handleCheck}
                    disabled={checkLoading || (!checkText.trim() && !selectedTitle && !translatedText)}
                  >
                    {checkLoading ? '检测中…' : '🛡️ 开始检测'}
                  </button>
                  <button
                    className="zen-btn zen-btn-secondary"
                    onClick={handleGenerateFinal}
                    disabled={finalLoading || (!selectedTitle && !translatedText)}
                  >
                    {finalLoading ? '生成中…' : '✨ 直接生成终稿'}
                  </button>
                  {finalError && (
                    <p className="text-xs text-[var(--accent-warm)]">{finalError}</p>
                  )}
                </div>
              </div>

              {checkResult && (
                <div className="zen-card p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                      checkResult.score >= 85 ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]' :
                      checkResult.score >= 60 ? 'bg-[var(--accent-warm)]/15 text-[var(--accent-warm)]' :
                      'bg-[var(--accent-red)]/15 text-[var(--accent-red)]'
                    }`}>
                      {checkResult.score}
                    </div>
                    <div>
                      <p className={`font-semibold ${checkResult.score >= 85 ? 'text-[var(--accent-primary)]' : checkResult.score >= 60 ? 'text-[var(--accent-warm)]' : 'text-[var(--accent-red)]'}`}>
                        {checkResult.score >= 85 ? '合规，可以发布' : checkResult.score >= 60 ? '需要优化' : '高风险，请修改'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">共发现 {checkResult.issues.length} 个问题词</p>
                    </div>
                  </div>

                  {checkResult.issues.length > 0 ? (
                    <div className="space-y-2">
                      {checkResult.issues.map((issue, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/15">
                          <span className="text-[var(--accent-red)] font-medium">&ldquo;{issue.word}&rdquo;</span>
                          {issue.replacement && (
                            <span className="text-xs text-[var(--text-muted)]">→ 建议改为 &ldquo;{issue.replacement}&rdquo;</span>
                          )}
                        </div>
                      ))}
                      <div className="mt-4 flex items-center gap-3 flex-wrap">
                        <button
                          className="zen-btn zen-btn-primary"
                          onClick={handleGenerateFinal}
                          disabled={finalLoading || (!selectedTitle && !translatedText)}
                        >
                          {finalLoading ? '生成中…' : '✨ 仍要生成终稿'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" className="mx-auto">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <p className="mt-3 text-[var(--accent-primary)] font-medium">内容合规，可以发布！</p>
                      <button
                        className="mt-4 zen-btn zen-btn-primary"
                        onClick={handleGenerateFinal}
                        disabled={finalLoading || (!selectedTitle && !translatedText)}
                      >
                        {finalLoading ? (
                          <><svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>生成中…</>
                        ) : (
                          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.853 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.853 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.853 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.853 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>✨ 生成可发布终稿</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 完整创作摘要 */}
              <div className="zen-card p-6">
                <h3 className="font-serif font-semibold mb-4">📋 创作摘要</h3>
                <div className="space-y-3">
                  {[
                    { label: '标题', value: selectedTitle, action: () => goToStep('titles') },
                    { label: '正文', value: translatedText.slice(0, 100) + (translatedText.length > 100 ? '…' : ''), action: () => goToStep('translate') },
                    { label: '标签', value: tags.join(' '), action: () => goToStep('tags') },
                    { label: '金句', value: posterQuote || selectedTitle, action: () => goToStep('poster') },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-xs font-medium text-[var(--text-muted)] w-12 flex-shrink-0 pt-0.5">{item.label}</span>
                      <span className="text-sm text-[var(--text-secondary)] flex-1">{item.value || '— 未填写'}</span>
                      {item.value && (
                        <button className="text-xs text-[var(--accent-primary)] hover:underline flex-shrink-0" onClick={item.action}>修改</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── 步骤7：终稿生成 ── */}
          {currentStep === 'final' && (
            <div className="animate-fade-in space-y-6">
              {finalDraft ? (
                <>
                  <div className="zen-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white text-xs flex items-center justify-center">✓</span>
                        <h2 className="font-serif text-lg font-semibold">终稿已生成</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="zen-btn zen-btn-ghost text-xs"
                          onClick={() => navigator.clipboard.writeText(finalDraft)}
                        >
                          复制全文
                        </button>
                        <button
                          className="zen-btn zen-btn-ghost text-xs"
                          onClick={() => { setFinalDraft(''); setFinalError(''); }}
                        >
                          重新生成
                        </button>
                      </div>
                    </div>
                    <div className="zen-prose whitespace-pre-wrap text-sm leading-relaxed bg-[var(--bg-secondary)] p-5 rounded-[var(--radius-sm)]">
                      {finalDraft}
                    </div>
                    <div className="mt-5 p-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20">
                      <p className="text-sm font-medium text-[var(--accent-primary)] mb-1">✓ 复制即可发布</p>
                      <p className="text-xs text-[var(--text-muted)]">终稿已整合标题、正文、标签、封面文字建议。直接复制全文粘贴到小红书发布即可。</p>
                    </div>
                  </div>

                  {/* 快速操作区 */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <a
                      href="/tools/poster"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="zen-card p-5 flex items-center gap-4 hover:border-[var(--accent-primary)]/40 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--text-secondary)]/10 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">生成封面图</p>
                        <p className="text-xs text-[var(--text-muted)]">前往墨境，用终稿中的封面文字生成精美封面</p>
                      </div>
                    </a>
                    <a
                      href="/tools/calendar"
                      className="zen-card p-5 flex items-center gap-4 hover:border-[var(--accent-primary)]/40 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/10 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">加入发布日历</p>
                        <p className="text-xs text-[var(--text-muted)]">排入下周发布计划，保持稳定的发布节奏</p>
                      </div>
                    </a>
                  </div>
                </>
              ) : (
                /* 无终稿时的引导状态 */
                <div className="zen-card p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--accent-primary)]/12 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <h2 className="font-serif text-lg font-semibold mb-2">生成你的第一篇终稿</h2>
                  <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                    完成前面的步骤后，在这里一键生成可发布终稿，整合标题、正文、标签
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-6 text-left">
                    {[
                      { icon: '📝', label: '标题', sub: selectedTitle ? selectedTitle.slice(0, 20) + (selectedTitle.length > 20 ? '…' : '') || '未选' : '未选', done: !!selectedTitle },
                      { icon: '📄', label: '正文', sub: translatedText ? translatedText.slice(0, 15) + '…' : '未生成', done: !!translatedText },
                      { icon: '🏷', label: '标签', sub: tags.length > 0 ? tags.slice(0, 3).join(' ') : '未生成', done: tags.length > 0 },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]">
                        <p className="text-lg mb-1">{item.icon}</p>
                        <p className="text-xs font-medium text-[var(--text-muted)]">{item.label}</p>
                        <p className={`text-xs mt-0.5 ${item.done ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>{item.sub}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    className="zen-btn zen-btn-primary"
                    onClick={handleGenerateFinal}
                    disabled={finalLoading || (!selectedTitle && !translatedText)}
                  >
                    {finalLoading ? (
                      <><svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/></svg>生成中…</>
                    ) : '✨ 生成终稿'}
                  </button>
                  {finalError && (
                    <p className="text-xs text-[var(--accent-warm)] mt-3">{finalError}</p>
                  )}

                  <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
                    <button onClick={() => goToStep('check')} className="hover:text-[var(--accent-primary)]">合规检测</button>
                    <span>|</span>
                    <button onClick={() => goToStep('tags')} className="hover:text-[var(--accent-primary)]">添加标签</button>
                    <span>|</span>
                    <button onClick={() => goToStep('titles')} className="hover:text-[var(--accent-primary)]">生成标题</button>
                  </div>
                </div>
              )}

              {/* 从头开始新一篇 */}
              {(finalDraft || selectedTitle || translatedText) && (
                <div className="text-center pt-4 border-t border-[var(--border-light)]">
                  <button
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                    onClick={() => {
                      setSourceText('');
                      setTranslatedText('');
                      setTitles([]);
                      setSelectedTitle('');
                      setTags([]);
                      setPosterQuote('');
                      setCheckResult(null);
                      setCheckText('');
                      setFinalDraft('');
                      setFinalError('');
                      goToStep('collect');
                    }}
                  >
                    ← 从头开始创作新一篇
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default TranscriptStudio;
