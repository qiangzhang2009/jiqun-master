'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { getAccounts, getActiveAccount, setActiveAccount, type Account } from '@/lib/storage';

const navLinks = [
  { href: '/tools', label: '工具站' },
  { href: '/tools/studio', label: '创作工作台' },
  { href: '/tools/library', label: '素材库' },
  { href: '/tools/review', label: '内容复盘' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActive] = useState<Account | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccounts(getAccounts());
    setActive(getActiveAccount());
  }, []);

  // 点击外部关闭账号菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSwitchAccount = (id: string) => {
    setActiveAccount(id);
    setActive(getAccounts().find(a => a.id === id) || null);
    setAccountMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-light)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-dark)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F7F5F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="2" x2="12" y2="8"/>
              <line x1="12" y1="16" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="8" y2="12"/>
              <line x1="16" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <span className="font-serif text-lg font-semibold text-[var(--text-primary)] tracking-wide group-hover:text-[var(--accent-primary)] transition-colors">
            禅镜
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: account switcher + CTA */}
        <div className="flex items-center gap-3">
          {/* 账号切换器 */}
          <div className="relative" ref={menuRef}>
            <button
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] hover:border-[var(--accent-primary)]/40 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all max-w-[160px]"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            >
              <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)]/15 flex items-center justify-center flex-shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span className="truncate">{activeAccount?.name || '选择账号'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`flex-shrink-0 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {accountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 zen-card p-2 shadow-xl z-50 animate-fade-in">
                <p className="text-xs text-[var(--text-muted)] px-2 py-1.5 mb-1">切换账号</p>
                {accounts.length === 0 && (
                  <div className="px-2 py-3 text-center">
                    <p className="text-xs text-[var(--text-muted)]">还没有账号</p>
                    <Link href="/tools/accounts" className="text-xs text-[var(--accent-primary)] hover:underline" onClick={() => setAccountMenuOpen(false)}>
                      去添加
                    </Link>
                  </div>
                )}
                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] flex items-center gap-2 transition-colors ${
                      acc.id === activeAccount?.id
                        ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                        : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    }`}
                    onClick={() => handleSwitchAccount(acc.id)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      acc.id === activeAccount?.id
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                    }`}>
                      {acc.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{acc.name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{acc.type}</p>
                    </div>
                    {acc.id === activeAccount?.id && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                ))}
                <div className="border-t border-[var(--border-light)] mt-1 pt-1">
                  <Link
                    href="/tools/accounts"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] transition-colors"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    管理账号
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <Link href="/tools/studio" className="zen-btn zen-btn-primary text-sm py-2 px-5 hidden sm:flex">
            创作
          </Link>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {mobileOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border-light)] bg-[var(--bg-primary)] animate-slide-down">
          <nav className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-1">
            {navLinks.map(link => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all ${
                    active
                      ? 'bg-[var(--bg-secondary)] text-[var(--accent-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-[var(--border-light)] mt-1 pt-1">
              <Link href="/tools/accounts" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-[var(--radius-sm)]">
                账号管理
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
