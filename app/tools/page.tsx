import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const modules = [
  {
    id: 'check',
    name: '净言',
    sub: '合规检测',
    desc: '违禁词实时检测，限流风险预警，覆盖12类300+词条。发布前必查。',
    href: '/tools/check',
    tag: '免费',
    tagColor: 'var(--accent-primary)',
    color: 'var(--accent-primary)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    id: 'translate',
    name: '转语',
    sub: '内容翻译',
    desc: '法师讲座转小红书图文，学术语言转现代表达，3种输出模式。',
    href: '/tools/translate',
    tag: 'AI',
    tagColor: 'var(--accent-warm)',
    color: 'var(--accent-warm)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/>
        <path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>
      </svg>
    ),
  },
  {
    id: 'title',
    name: '钩子',
    sub: '标题生成',
    desc: '5种标题类型，20个备选，一键生成爆款标题，字数自动检测。',
    href: '/tools/title',
    tag: '免费',
    tagColor: 'var(--accent-primary)',
    color: 'var(--accent-warm)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
  },
  {
    id: 'tags',
    name: '灵签',
    sub: '标签推荐',
    desc: '核心+长尾标签组合，搜索量与竞争度双重参考，内置佛教垂直标签库。',
    href: '/tools/tags',
    tag: '免费',
    tagColor: 'var(--accent-primary)',
    color: 'var(--accent-light)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    id: 'poster',
    name: '墨境',
    sub: '金句图文',
    desc: '5种禅意模板，法师金句一键生成精美封面图，直接下载使用。',
    href: '/tools/poster',
    tag: '免费',
    tagColor: 'var(--accent-primary)',
    color: 'var(--text-secondary)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    id: 'calendar',
    name: '时序',
    sub: '发布日历',
    desc: '周视图规划，内容状态跟踪，最佳发布时间推荐，批量导入已生成内容。',
    href: '/tools/calendar',
    tag: '免费',
    tagColor: 'var(--accent-primary)',
    color: 'var(--accent-primary)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'diagnose',
    name: '观己',
    sub: '账号诊断',
    desc: '定位清晰度、人设温度、差异化三维诊断，弘法初心与平台特性适配分析。',
    href: '/tools/diagnose',
    tag: 'AI',
    tagColor: 'var(--accent-warm)',
    color: 'var(--accent-primary)',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
];

export default function ToolsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Page header */}
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <h1 className="font-serif text-3xl font-bold mb-2">工具站</h1>
            <p className="text-[var(--text-secondary)] text-sm">七件法器，解决佛学小红书运营的核心问题</p>
          </div>
        </div>

        {/* Modules grid */}
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <Link
                key={m.id}
                href={m.href}
                className={`module-card zen-card p-7 group animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-14 h-14 rounded-[var(--radius-md)] flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${m.color}18`, color: m.color }}
                  >
                    {m.icon}
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${m.tagColor}18`, color: m.tagColor }}
                  >
                    {m.tag}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-serif text-xl font-semibold">{m.name}</span>
                  <span className="text-sm text-[var(--text-muted)]">/{m.sub}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{m.desc}</p>
                <div className="mt-5 pt-4 border-t border-[var(--border-light)] flex items-center gap-1 text-sm text-[var(--accent-primary)] font-medium">
                  <span className="group-hover:gap-2 transition-all">打开工具</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}