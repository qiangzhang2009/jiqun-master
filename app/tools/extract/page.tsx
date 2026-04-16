'use client';

import { useState, useEffect } from 'react';
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

const STORAGE_KEY = 'zenjing_xhs_notes';

const EXTRACTOR_SCRIPT = `(function(){
  var results=[];
  var noteIds=[];
  var u=location.href;
  var m=u.match(/xiaohongshu\\.com\\/discovery\\/item\\/([a-zA-Z0-9]+)/);
  if(m)noteIds.push({id:m[1],url:u});
  document.querySelectorAll('a[href*="discovery/item"]').forEach(function(a){
    var h=a.getAttribute('href');
    var mm=h.match(/\\/discovery\\/item\\/([a-zA-Z0-9]+)/);
    if(mm&&!noteIds.filter(function(i){return i.id===mm[1];}).length)
      noteIds.push({id:mm[1],url:'https://www.xiaohongshu.com'+h});
  });
  document.querySelectorAll('script').forEach(function(s){
    var t=s.textContent||'';
    var ms=t.matchAll(/"noteId"\\s*:\\s*"([a-zA-Z0-9]+)"/g);
    Array.from(ms).forEach(function(x){
      if(!noteIds.filter(function(i){return i.id===x[1];}).length)
        noteIds.push({id:x[1]});
    });
  });
  var ti='',de='',ni='',lk='',cl='';
  document.querySelectorAll('script').forEach(function(s){
    var tx=s.textContent||'';
    if(!ti){var mt=tx.match(/"title"\\s*:\\s*"([^"]{1,200})"/);if(mt)ti=mt[1];}
    if(!de){var md=tx.match(/"desc"\\s*:\\s*"([^"]{1,3000})"/);if(md)de=md[1];}
    if(!ni){var mn=tx.match(/"nickname"\\s*:\\s*"([^"]*)"/);if(mn)ni=mn[1];}
    if(!lk){var ml=tx.match(/"likedCount"\\s*:\\s*(\\d+)/);if(ml)lk=ml[1];}
    if(!cl){var mc=tx.match(/"collectedCount"\\s*:\\s*(\\d+)/);if(mc)cl=mc[1];}
  });
  var mainNote={id:noteIds[0]?.id||'x',title:ti,content:de,author:ni,likes:lk,collected:cl,url:u};
  var noteUrls=noteIds.slice(1,20).map(function(i){return i.url||'https://www.xiaohongshu.com/discovery/item/'+i.id;});
  localStorage.setItem('zenjing_xhs_notes',JSON.stringify({notes:[mainNote],noteIds:noteUrls,count:noteIds.length,source:u}));
  document.body.innerHTML='<div style="font-family:system-ui;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#f7f5f0;color:#333;">'+
    '<div style="font-size:48px;margin-bottom:16px;">✅</div>'+
    '<div style="font-size:20px;font-weight:600;margin-bottom:8px;">提取完成</div>'+
    '<div style="color:#666;font-size:14px;">共 '+noteIds.length+' 个笔记，正在获取内容…</div>'+
    '<div style="margin-top:24px;font-size:12px;color:#999;">请稍候，窗口将自动关闭</div>'+
    '</div>';
  setTimeout(function(){
    try{localStorage.setItem('zenjing_done','1');}catch(e){}
    window.close();
  },500);
})()`;

function openExtractor(xhsUrl: string) {
  if (!xhsUrl.trim()) {
    alert('请先输入小红书链接');
    return;
  }
  const popup = window.open(xhsUrl, '_blank', 'width=1,height=1,left=-9999,top=-9999,popup=yes');
  if (!popup) {
    alert('浏览器拦截了弹窗，请在浏览器设置中允许 https://zenjing.vercel.app 弹出窗口');
    return;
  }
  const tid = setInterval(() => {
    try {
      if (popup.document.readyState === 'complete') {
        clearInterval(tid);
        popup.document.open();
        popup.document.write(`<!DOCTYPE html><html><head><title>提取中</title></head><body><script>${EXTRACTOR_SCRIPT}<\/script></body></html>`);
        popup.document.close();
        popup.focus();
      }
    } catch { clearInterval(tid); }
  }, 100);
  setTimeout(() => clearInterval(tid), 8000);
}

export default function ExtractPage() {
  const [notes, setNotes] = useState<ExtractedNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noteCount, setNoteCount] = useState(0);
  const [xhsUrl, setXhsUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.notes?.length > 0) {
          setNoteCount(data.count || data.notes.length);
          fetchNoteContent(data);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch { /* ignore */ }
    }
  }, []);

  const fetchNoteContent = async (data: {
    notes: ExtractedNote[];
    noteIds: string[];
  }) => {
    setNotes(data.notes);
    if (!data.noteIds || data.noteIds.length === 0) return;

    setLoading(true);
    const allNotes = [...data.notes];
    await Promise.allSettled(
      (data.noteIds as string[]).slice(0, 6).map(async (url: string) => {
        try {
          const res = await fetch('/api/xhs/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });
          const d = await res.json();
          if (d.success && d.data) {
            allNotes.push({
              id: (url.match(/discovery\/item\/([a-zA-Z0-9]+)/)?.[1]) || String(Math.random()),
              title: d.data.title || '',
              content: d.data.content || '',
              author: d.data.author || '',
              likes: d.data.likes || '',
              collected: d.data.collected || '',
              url,
            });
          }
        } catch { /* skip */ }
      })
    );
    setNotes(allNotes.filter((r, i) => i === 0 || r.content));
    setLoading(false);
  };

  const handleExtract = () => {
    const url = xhsUrl.trim();
    if (!url) { setUrlError('请输入小红书链接'); return; }
    if (!url.includes('xiaohongshu.com') && !url.includes('xhslink.com')) {
      setUrlError('请输入有效的小红书链接'); return;
    }
    setUrlError('');
    openExtractor(url);
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
            <p className="text-[var(--text-secondary)] text-sm">粘贴链接 → 点击提取 → 自动获取内容，完全不需要手动复制粘贴</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
          {/* 核心操作 */}
          <div className="zen-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#FF4D4F]/12 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4D4F" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold">一键提取</h2>
                <p className="text-xs text-[var(--text-muted)]">粘贴小红书笔记链接，自动获取正文内容</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  className="zen-input"
                  placeholder="粘贴小红书笔记链接（包含 /discovery/item/ 的URL）"
                  value={xhsUrl}
                  onChange={e => { setXhsUrl(e.target.value); setUrlError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleExtract()}
                />
                {urlError && <p className="text-xs text-[var(--accent-warm)] mt-1.5">{urlError}</p>}
              </div>
              <button
                className="zen-btn zen-btn-primary w-full py-3 text-base"
                onClick={handleExtract}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                提取内容
              </button>
            </div>

            <div className="mt-4 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]">
              <p className="text-xs text-[var(--text-muted)]">
                <strong>原理说明：</strong>系统会自动打开小红书页面，利用你的登录状态提取笔记内容，全程在你的浏览器内完成，不需要手动复制粘贴。
                点击「提取内容」后，等待浏览器弹出窗口自动关闭即可。
              </p>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="zen-card p-6">
            <h3 className="font-serif text-base font-semibold mb-4">使用步骤</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: '复制小红书笔记链接', desc: '在小红书App或网页版，打开你想提取的笔记，点击右上角「分享」→「复制链接」' },
                { step: '2', title: '粘贴到上方输入框', desc: '把复制的链接粘贴到本页面顶部的输入框中' },
                { step: '3', title: '点击「提取内容」', desc: '等待浏览器弹出小红书页面，提取完成后自动关闭，内容显示在下方' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.step === '1' ? item.title : item.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 提取结果 */}
          {(loading || notes.length > 0) && (
            <div className="zen-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-base font-semibold">
                  提取结果
                  {noteCount > 0 && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] font-medium">
                      {noteCount} 个笔记
                    </span>
                  )}
                </h3>
                {notes.length > 0 && (
                  <button className="text-xs zen-btn zen-btn-primary" onClick={handleCopyAll}>
                    {copied ? '✓ 已复制全部' : '复制全部内容'}
                  </button>
                )}
              </div>

              {loading && (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <svg className="animate-spin-slow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8"/>
                  </svg>
                  <p className="text-sm text-[var(--text-secondary)]">正在获取笔记内容…</p>
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
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-4">
                        {note.content || '（正文未能提取，可尝试直接复制正文粘贴）'}
                      </p>
                      {(note.likes || note.collected) && (
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                          {note.likes ? `♥ ${note.likes}` : ''} {note.collected ? `★ ${note.collected}` : ''}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/8 border border-[var(--accent-primary)]/20">
                    <p className="text-sm text-[var(--accent-primary)] font-medium mb-1">内容已准备好</p>
                    <p className="text-xs text-[var(--text-secondary)]">点击「复制全部内容」，然后去创作工作台粘贴</p>
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
            <div className="text-center py-10">
              <svg className="mx-auto mb-3 text-[var(--text-muted)]" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">粘贴链接即可自动提取</p>
              <p className="text-xs text-[var(--text-muted)]">不需要手动复制粘贴，一步搞定</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
