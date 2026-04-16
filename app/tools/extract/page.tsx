'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type ExtractedNote = {
  id: string;
  title: string;
  content: string;
  author: string;
  likes: string;
  collected: string;
  url: string;
};

function BookmarkletCard() {
  const [copied, setCopied] = useState(false);

  // Bookmarklet: 从当前小红书页面提取笔记ID并保存
  const bookmarkletCode = `javascript:(function(){
  var url=location.href;
  var host=location.hostname;
  if(!host.includes('xiaohongshu')&&!host.includes('xhslink')){alert('请在小红书页面使用此书签');return;}
  var noteIds=[];
  // 方法1: 从URL中提取
  var m=url.match(/xiaohongshu\\.com\\/discovery\\/item\\/([a-zA-Z0-9]+)/);
  if(m){noteIds.push({id:m[1],type:'note',url:url});}
  // 方法2: 从页面DOM提取笔记ID列表
  var scripts=document.querySelectorAll('script');
  for(var s of scripts){
    var txt=s.textContent||'';
    var ids=txt.match(/"noteId"\\s*:\\s*"([a-zA-Z0-9]+)"/g)||[];
    ids.forEach(function(x){var id=x.match(/"noteId"\\s*:\\s*"([a-zA-Z0-9]+)"/);if(id&&noteIds.filter(function(n){return n.id===id[1];}).length===0){noteIds.push({id:id[1],type:'note'});}});
  }
  // 也从a标签href中提取
  var links=document.querySelectorAll('a[href*="discovery/item"]');
  for(var l of links){
    var href=l.getAttribute('href')||'';
    var hm=href.match(/\\/discovery\\/item\\/([a-zA-Z0-9]+)/);
    if(hm&&noteIds.filter(function(n){return n.id===hm[1];}).length===0){
      noteIds.push({id:hm[1],type:'note',url:'https://www.xiaohongshu.com'+href});
    }
  }
  if(noteIds.length===0){alert('未找到笔记ID，请确保在小红书页面使用');return;}
  var STORAGE_KEY='zenjing_xhs_pending';
  var existing=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
  var merged=existing.concat(noteIds.filter(function(n){return existing.filter(function(e){return e.id===n.id;}).length===0;}));
  localStorage.setItem(STORAGE_KEY,JSON.stringify(merged.slice(0,20)));
  alert('已提取 '+merged.length+' 个笔记ID，即将跳转到提取页面');
  window.open('${typeof window !== "undefined" ? window.location.origin : ""}/tools/extract','_blank');
})()`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="zen-card p-6">
      <h3 className="font-serif text-base font-semibold mb-1">书签工具</h3>
      <p className="text-xs text-[var(--text-secondary)] mb-4">拖动下方按钮到浏览器书签栏，在小红书页面点击即可自动提取</p>

      {/* 书签按钮 */}
      <a
        href={bookmarkletCode}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FF4D4F] text-white font-medium text-sm hover:opacity-90 transition-opacity mb-4"
        title="拖到书签栏"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
        禅镜 · 提取小红书内容
      </a>

      <div className="flex items-center gap-3">
        <button
          className="text-xs text-[var(--accent-primary)] hover:underline"
          onClick={handleCopy}
        >
          {copied ? '✓ 已复制代码' : '复制书签代码'}
        </button>
        <span className="text-xs text-[var(--text-muted)]">|</span>
        <span className="text-xs text-[var(--text-muted)]">不会拖？查看图文教程</span>
      </div>

      <div className="mt-4 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] text-xs text-[var(--text-muted)]">
        <strong>书签栏在哪里？</strong> 浏览器顶部那一行。如果看不到，Chrome 可以用 <code className="bg-[var(--bg-primary)] px-1 rounded">Ctrl+Shift+B</code>（Windows）或 <code className="bg-[var(--bg-primary)] px-1 rounded">Cmd+Shift+B</code>（Mac）调出书签栏。
      </div>
    </div>
  );
}

export default function ExtractPage() {
  const [notes, setNotes] = useState<ExtractedNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedCount, setExtractedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const STORAGE_KEY = 'zenjing_xhs_pending';
    const pending = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (pending.length > 0) {
      setExtractedCount(pending.length);
      fetchNotes(pending);
      // 清空待处理队列
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const fetchNotes = async (pendingNotes: Array<{ id: string; url?: string }>) => {
    setLoading(true);
    setError('');
    const results: ExtractedNote[] = [];

    await Promise.allSettled(
      pendingNotes.map(async (note) => {
        try {
          const res = await fetch('/api/xhs/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: note.url || `https://www.xiaohongshu.com/discovery/item/${note.id}` }),
          });
          const data = await res.json();
          if (data.success && data.data) {
            results.push({
              id: note.id,
              title: data.data.title || '',
              content: data.data.content || '',
              author: data.data.author || '',
              likes: data.data.likes || '',
              collected: data.data.collected || '',
              url: note.url || `https://www.xiaohongshu.com/discovery/item/${note.id}`,
            });
          }
        } catch { /* skip */ }
      })
    );

    setNotes(results);
    setLoading(false);
  };

  const handleCopyAll = () => {
    const text = notes.map((n, i) => {
      const parts: string[] = [];
      parts.push(`【笔记 ${i + 1}】`);
      if (n.title) parts.push(`标题：${n.title}`);
      if (n.content) parts.push(`正文：\n${n.content}`);
      if (n.author) parts.push(`作者：${n.author}`);
      if (n.likes || n.collected) {
        const stats: string[] = [];
        if (n.likes) stats.push(`获赞 ${n.likes}`);
        if (n.collected) stats.push(`收藏 ${n.collected}`);
        parts.push(`互动：${stats.join(' · ')}`);
      }
      return parts.join('\n');
    }).join('\n\n' + '─'.repeat(30) + '\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[#FF4D4F]/12 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4D4F" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">小红书内容提取</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">用浏览器书签工具自动提取小红书笔记内容，绕过登录限制</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
          {/* 使用流程 */}
          <div className="zen-card p-6">
            <h3 className="font-serif text-base font-semibold mb-4">使用方法（3步）</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: '拖书签到浏览器', desc: '把下方红色的「禅镜·提取小红书内容」按钮拖到浏览器书签栏' },
                { step: '2', title: '打开小红书笔记/主页', desc: '在浏览器中打开你的小红书页面，登录后浏览到想提取的笔记列表页' },
                { step: '3', title: '点击书签 → 自动提取', desc: '点击书签栏的按钮，系统自动提取笔记ID，跳转到本页显示内容' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 书签工具 */}
          <BookmarkletCard />

          {/* 提取结果 */}
          {(loading || notes.length > 0) && (
            <div className="zen-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-base font-semibold">
                  提取结果
                  {extractedCount > 0 && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] font-medium">
                      {extractedCount} 个笔记
                    </span>
                  )}
                </h3>
                {notes.length > 0 && (
                  <button
                    className="text-xs zen-btn zen-btn-primary"
                    onClick={handleCopyAll}
                  >
                    {copied ? '✓ 已复制全部' : '复制全部内容'}
                  </button>
                )}
              </div>

              {loading && (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <svg className="animate-spin-slow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
                  </svg>
                  <p className="text-sm text-[var(--text-secondary)]">正在提取笔记内容…</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--accent-warm)]/8 border border-[var(--accent-warm)]/20">
                  <p className="text-sm text-[var(--accent-warm)]">{error}</p>
                </div>
              )}

              {notes.length > 0 && (
                <div className="space-y-5">
                  {notes.map((note, i) => (
                    <div key={note.id} className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[var(--accent-primary)]">笔记 {i + 1}</span>
                        <button
                          className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
                          onClick={() => navigator.clipboard.writeText(note.content || note.title || '')}
                        >
                          复制此篇
                        </button>
                      </div>
                      {note.title && <p className="text-sm font-medium mb-2">{note.title}</p>}
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-4">{note.content || '（正文未能提取）'}</p>
                      {(note.likes || note.collected) && (
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                          {note.likes ? `♥ ${note.likes}` : ''} {note.collected ? `★ ${note.collected}` : ''}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/8 border border-[var(--accent-primary)]/20">
                    <p className="text-sm text-[var(--accent-primary)] font-medium mb-1">内容已准备好</p>
                    <p className="text-xs text-[var(--text-secondary)]">点击上方「复制全部内容」→ 跳转到创作工作台粘贴即可</p>
                    <a href="/tools/studio" className="inline-flex items-center gap-1 mt-2 text-xs text-[var(--accent-primary)] hover:underline">
                      前往创作工作台 →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 空状态 */}
          {!loading && notes.length === 0 && (
            <div className="text-center py-16">
              <svg className="mx-auto mb-4 text-[var(--text-muted)]" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <p className="text-[var(--text-secondary)] text-sm font-medium mb-2">还没有提取到内容</p>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                请先在浏览器中打开小红书，然后点击书签栏里的「禅镜·提取小红书内容」按钮
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
