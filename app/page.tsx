import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

const modules = [
  {
    id: 'check',
    name: '净言',
    sub: '合规检测',
    desc: '违禁词实时检测，限流风险预警，覆盖12类300+词条',
    href: '/tools/check',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    color: 'var(--accent-primary)',
  },
  {
    id: 'translate',
    name: '转语',
    sub: '内容翻译',
    desc: '法师讲座转小红书图文，学术语言转现代表达',
    href: '/tools/translate',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8l6 6"/>
        <path d="M4 14l6-6 2-3"/>
        <path d="M2 5h12"/>
        <path d="M7 2h1"/>
        <path d="M22 22l-5-10-5 10"/>
        <path d="M14 18h6"/>
      </svg>
    ),
    color: 'var(--accent-warm)',
  },
  {
    id: 'title',
    name: '钩子',
    sub: '标题生成',
    desc: '5种标题类型，20个备选，一键生成爆款标题',
    href: '/tools/title',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    color: 'var(--accent-warm)',
  },
  {
    id: 'tags',
    name: '灵签',
    sub: '标签推荐',
    desc: '核心+长尾标签组合，搜索量与竞争度双重参考',
    href: '/tools/tags',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    color: 'var(--accent-light)',
  },
  {
    id: 'poster',
    name: '墨境',
    sub: '金句图文',
    desc: '5种禅意模板，法师金句一键生成精美封面图',
    href: '/tools/poster',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    color: 'var(--text-secondary)',
  },
  {
    id: 'calendar',
    name: '时序',
    sub: '发布日历',
    desc: '周视图规划，内容状态跟踪，最佳时间推荐',
    href: '/tools/calendar',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    color: 'var(--accent-primary)',
  },
  {
    id: 'diagnose',
    name: '观己',
    sub: '账号诊断',
    desc: '定位清晰度、人设温度、差异化三维诊断报告',
    href: '/tools/diagnose',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    color: 'var(--accent-primary)',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background zen pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}/>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]"/>

          <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
            {/* Badge */}
            <div className="animate-fade-in-up stagger-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse-glow"/>
              <span className="text-xs text-[var(--text-secondary)] font-medium tracking-wide">专为佛学与心灵成长创作者设计</span>
            </div>

            {/* Main title */}
            <h1 className="animate-fade-in-up stagger-2 font-serif text-5xl md:text-6xl font-bold tracking-tight mb-4 text-[var(--text-primary)]">
              让弘法之道<br/>行于指尖
            </h1>

            <p className="animate-fade-in-up stagger-3 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
              七个专注的工具，覆盖从内容创作到发布管理的全链路。<br/>
              每一处设计，都源于对弘法初心的理解。
            </p>

            {/* CTA buttons */}
            <div className="animate-fade-in-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tools" className="zen-btn zen-btn-dark text-base px-8 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                立即开始
              </Link>
              <Link href="/tools/check" className="zen-btn zen-btn-secondary text-base px-8 py-3">
                先检测一下
              </Link>
            </div>

            {/* Zen decoration */}
            <div className="animate-fade-in-up stagger-5 mt-16 flex items-center justify-center gap-3 opacity-40">
              <div className="w-16 h-px bg-[var(--border)]"/>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <circle cx="12" cy="12" r="8" strokeDasharray="2 4"/>
              </svg>
              <div className="w-16 h-px bg-[var(--border)]"/>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="zen-divider"/>
        </div>

        {/* Values Section */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-center font-serif text-2xl font-semibold mb-12 text-[var(--text-primary)]">
            工具如静室
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: '一站齐全',
                desc: '覆盖从内容创作到发布管理的全链路，七个工具相互衔接，无需切换多个平台。',
                num: '01',
              },
              {
                title: '懂你语境',
                desc: '专为佛法与心灵成长内容优化，内置佛教术语词库与垂直标签库，非泛化工具能比。',
                num: '02',
              },
              {
                title: '禅意体验',
                desc: '界面如静室，每一次操作都是一次专注的创作。不追求繁复，只追求恰好。',
                num: '03',
              },
            ].map((v, i) => (
              <div key={v.title} className={`zen-card p-6 animate-fade-in-up stagger-${i + 1}`}>
                <span className="font-serif text-5xl font-bold text-[var(--border)] mb-4 block">{v.num}</span>
                <h3 className="font-serif text-lg font-semibold mb-3">{v.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="zen-divider"/>
        </div>

        {/* Modules Section */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl font-semibold mb-3">七件法器</h2>
            <p className="text-sm text-[var(--text-muted)]">每个工具对应一个真实痛点</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m, i) => (
              <Link
                key={m.id}
                href={m.href}
                className={`module-card zen-card p-6 group animate-fade-in-up stagger-${i + 1}`}
              >
                <div
                  className="w-12 h-12 rounded-[var(--radius-sm)] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${m.color}18`, color: m.color }}
                >
                  {m.icon}
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-lg font-semibold">{m.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">/{m.sub}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{m.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-[var(--accent-primary)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>进入工具</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="zen-divider"/>
        </div>

        {/* Pain Points Section */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl font-semibold mb-3">七个真实痛点，一个解法</h2>
            <p className="text-sm text-[var(--text-muted)]">这些问题，困扰着几乎所有佛学类小红书创作者</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { pain: '内容太长太深', solution: '转语', icon: '🔄' },
              { pain: '账号没有人设', solution: '观己', icon: '🔍' },
              { pain: '发布随缘无节奏', solution: '时序', icon: '📅' },
              { pain: '内容形式不接地气', solution: '墨境', icon: '🎨' },
              { pain: '违禁词导致限流', solution: '净言', icon: '🛡' },
              { pain: '标签随便打', solution: '灵签', icon: '🏷' },
              { pain: '运营资源极度有限', solution: '全站', icon: '⚡' },
            ].map((p, i) => (
              <div key={p.pain} className={`animate-fade-in-up stagger-${i + 1} zen-card p-4 flex items-center gap-4`}>
                <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  <span className="font-serif text-base font-bold text-[var(--accent-primary)]">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-[var(--text-primary)]">{p.pain}</p>
                </div>
                <div className="text-xs text-[var(--text-muted)]">→</div>
                <div className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium">
                  {p.solution}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[var(--bg-dark)]">
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <h2 className="font-serif text-3xl font-bold text-[var(--bg-primary)] mb-4">
              从第一篇笔记开始
            </h2>
            <p className="text-[var(--text-muted)] text-base mb-8">
              研学小组的第一篇笔记，或许就是弘法在小红书上的起点。<br/>
              工具只是辅助，真正推动的，是那份想让更多人听法的愿心。
            </p>
            <Link href="/tools/check" className="zen-btn bg-[var(--bg-primary)] text-[var(--bg-dark)] hover:bg-[var(--bg-secondary)] text-base px-8 py-3 font-medium">
              净言 · 违禁词检测
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}