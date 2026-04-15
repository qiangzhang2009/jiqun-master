'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

type ContentItem = {
  id: string;
  title: string;
  tags: string;
  time: string;      // "HH:mm" e.g. "21:00"
  date: string;      // "YYYY-MM-DD" — fixed date field
  status: 'draft' | 'scheduled' | 'published';
  note?: string;
};

const TIME_SLOTS = [
  { time: '07:00', label: '早7点', note: '晨间活跃，职场/知识类内容效果好' },
  { time: '08:00', label: '早8点', note: '通勤时段，适合轻量内容' },
  { time: '12:00', label: '午12点', note: '午休时段，职场/成长类效果好' },
  { time: '20:00', label: '晚8点', note: '黄金时段，适合身心灵/佛法内容' },
  { time: '21:00', label: '晚9点', note: '最佳时段，佛法/心灵成长类首选' },
  { time: '22:00', label: '晚10点', note: '次优时段，适合深度内容' },
];

const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [addDate, setAddDate] = useState(todayStr());
  const [newItem, setNewItem] = useState<Pick<ContentItem, 'title' | 'tags' | 'time' | 'status'>>({
    title: '',
    tags: '',
    time: '21:00',
    status: 'draft',
  });

  const [items, setItems] = useState<ContentItem[]>([
    { id: '1', title: '法师开示：越想放下，越放不下', tags: '#佛法 #放下 #修行', time: '21:00', date: todayStr(), status: 'published' },
  ]);

  const now = new Date();

  const getWeekDays = (offset: number): Date[] => {
    const start = new Date(now);
    start.setDate(now.getDate() + offset * 7);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(weekOffset);

  const dateToStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const getItemsForDay = (date: Date): ContentItem[] => {
    const dateStr = dateToStr(date);
    return items.filter(item => item.date === dateStr);
  };

  const isToday = (date: Date) => dateToStr(date) === dateToStr(now);

  const handleAddItem = () => {
    if (!newItem.title || !addDate) return;
    setItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newItem.title,
        tags: newItem.tags,
        time: newItem.time,
        date: addDate,
        status: newItem.status as ContentItem['status'],
      },
    ]);
    setNewItem({ title: '', tags: '', time: '21:00', status: 'draft' });
    setAddDate(todayStr());
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/12 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <h1 className="font-serif text-2xl font-bold">时序 · 发布日历</h1>
                </div>
                <p className="text-[var(--text-secondary)] text-sm">规划发布节奏，把握最佳时间窗口</p>
              </div>
              <button className="zen-btn zen-btn-primary" onClick={() => setShowAdd(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                添加内容
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              className="zen-btn zen-btn-ghost"
              onClick={() => setWeekOffset(prev => prev - 1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              上周
            </button>
            <div className="text-center">
              <p className="font-serif font-semibold">
                {weekStart.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} — {weekEnd.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {weekStart.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })} ~ {weekEnd.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
              </p>
            </div>
            <button
              className="zen-btn zen-btn-ghost"
              onClick={() => setWeekOffset(prev => prev + 1)}
            >
              下周
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-3 mb-8">
            {weekDays.map((day, i) => {
              const dayItems = getItemsForDay(day);
              const today = isToday(day);
              return (
                <div
                  key={i}
                  className={`rounded-[var(--radius-md)] border p-3 min-h-[120px] transition-colors ${
                    today
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/4'
                      : 'border-[var(--border-light)] bg-[var(--bg-card)]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-medium ${today ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'}`}>
                      周{DAYS[i]}
                    </span>
                    <span className={`text-sm font-semibold ${today ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {day.getDate()}
                    </span>
                    {today && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-[var(--accent-primary)]"/>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {dayItems.length === 0 && (
                      <p className="text-xs text-[var(--text-muted)]">-</p>
                    )}
                    {dayItems.map(item => (
                      <div key={item.id} className="text-xs p-1.5 rounded bg-[var(--bg-secondary)] group relative">
                        <p className="font-medium truncate pr-4">{item.title}</p>
                        <p className="text-[var(--text-muted)] text-[10px]">{item.time}</p>
                        <button
                          className="absolute top-1 right-1 text-[var(--text-muted)] hover:text-[var(--accent-red)] opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(item.id)}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Best time recommendations */}
          <div className="zen-card p-6 mb-8">
            <h3 className="font-serif font-semibold mb-4">佛法/心灵成长类最佳发布时间</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {TIME_SLOTS.map(slot => (
                <div key={slot.time} className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-serif font-semibold text-[var(--accent-primary)]">{slot.time}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{slot.label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{slot.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="p-5 rounded-[var(--radius-sm)] border border-[var(--border-light)] bg-[var(--bg-secondary)]/50">
            <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">运营小贴士</p>
            <ul className="text-xs text-[var(--text-muted)] space-y-1">
              <li>· 佛法/心灵成长内容首选晚间20:00~22:00</li>
              <li>· 周末发布效果通常优于工作日</li>
              <li>· 保持稳定的发布频率比偶尔爆款更有利于账号权重</li>
              <li>· 建议每周至少发布2篇以保持账号活跃度</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="zen-card p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif font-semibold mb-5">添加内容计划</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">日期</label>
                <input
                  type="date"
                  className="zen-input"
                  value={addDate}
                  onChange={e => setAddDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">标题</label>
                <input
                  className="zen-input"
                  placeholder="笔记标题"
                  value={newItem.title}
                  onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">标签</label>
                <input
                  className="zen-input"
                  placeholder="#佛法 #修行"
                  value={newItem.tags}
                  onChange={e => setNewItem(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">计划发布时间</label>
                <select
                  className="zen-input"
                  value={newItem.time}
                  onChange={e => setNewItem(prev => ({ ...prev, time: e.target.value }))}
                >
                  {TIME_SLOTS.map(slot => (
                    <option key={slot.time} value={slot.time}>{slot.time} — {slot.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">状态</label>
                <select
                  className="zen-input"
                  value={newItem.status}
                  onChange={e => setNewItem(prev => ({ ...prev, status: e.target.value as ContentItem['status'] }))}
                >
                  <option value="draft">草稿</option>
                  <option value="scheduled">待发布</option>
                  <option value="published">已发布</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3 justify-end">
              <button className="zen-btn zen-btn-secondary" onClick={() => setShowAdd(false)}>取消</button>
              <button className="zen-btn zen-btn-primary" onClick={handleAddItem} disabled={!newItem.title || !addDate}>
                添加
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
