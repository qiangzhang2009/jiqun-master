export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-light)] bg-[var(--bg-secondary)]/40">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--bg-dark)] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F7F5F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span className="font-serif text-sm text-[var(--text-secondary)]">禅镜</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center">
            专为佛学与心灵成长创作者设计 · 让弘法之道，行于指尖
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            仅供学习与公益使用
          </p>
        </div>
      </div>
    </footer>
  );
}
