'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getAccounts, saveAccount, deleteAccount, getActiveAccount, setActiveAccount, type Account } from '@/lib/storage';

function AccountCard({ account, isActive, onActivate, onEdit, onDelete }: {
  account: Account;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`zen-card p-5 transition-all ${isActive ? 'border-[var(--accent-primary)]/40 ring-1 ring-[var(--accent-primary)]/20' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-medium text-base mb-1">{account.name}</h3>
          <p className="text-xs text-[var(--text-muted)]">{account.type} · {account.audience || '未设置受众'}</p>
        </div>
        {isActive && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/12 text-[var(--accent-primary)] font-medium flex-shrink-0">
            当前账号
          </span>
        )}
      </div>
      {account.goal && (
        <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">{account.goal}</p>
      )}
      <div className="flex items-center gap-2">
        {!isActive && (
          <button className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" onClick={onActivate}>
            切换到此账号
          </button>
        )}
        <button className="text-xs px-3 py-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors" onClick={onEdit}>
          编辑
        </button>
        {!isActive && (
          <button className="text-xs px-3 py-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors" onClick={onDelete}>
            删除
          </button>
        )}
      </div>
    </div>
  );
}

function AccountModal({ account, onClose, onSave }: {
  account?: Account | null;
  onClose: () => void;
  onSave: (a: Omit<Account, 'id' | 'createdAt' | 'isDefault'> & { id?: string }) => void;
}) {
  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState<Account['type']>(account?.type || '传统文化/心灵成长');
  const [audience, setAudience] = useState(account?.audience || '');
  const [postsPerWeek, setPostsPerWeek] = useState(account?.postsPerWeek || '1~2');
  const [goal, setGoal] = useState(account?.goal || '');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, type, audience, postsPerWeek, goal });
    onClose();
  };

  const accountTypes: Account['type'][] = [
    '法师/僧人', '禅修道场/寺院', '居士/义工', '读书会/共修小组', '传统文化/心灵成长', '其他'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="zen-card p-6 w-full max-w-md mx-4">
        <h3 className="font-serif text-lg font-semibold mb-5">{account ? '编辑账号' : '新增账号'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">账号名称 <span className="text-[var(--accent-red)]">*</span></label>
            <input className="zen-input" placeholder="例如：静心小院、智慧人生" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">账号类型</label>
            <select className="zen-input" value={type} onChange={e => setType(e.target.value as Account['type'])}>
              {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">目标受众</label>
            <input className="zen-input" placeholder="例如：25~40岁焦虑的年轻人" value={audience} onChange={e => setAudience(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">发布频率</label>
            <select className="zen-input" value={postsPerWeek} onChange={e => setPostsPerWeek(e.target.value)}>
              <option value="不足1篇">不足1篇/周</option>
              <option value="1~2">1~2篇/周</option>
              <option value="3~5">3~5篇/周</option>
              <option value="5篇以上">5篇以上/周</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">运营目标</label>
            <textarea className="zen-textarea h-20" placeholder="让禅修走进千家万户的日常生活……" value={goal} onChange={e => setGoal(e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button className="zen-btn zen-btn-ghost" onClick={onClose}>取消</button>
          <button className="zen-btn zen-btn-primary" onClick={handleSave} disabled={!name.trim()}>保存</button>
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const reload = useCallback(() => {
    setAccounts(getAccounts());
    setActiveId(getActiveAccount()?.id || '');
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleActivate = (id: string) => {
    setActiveAccount(id);
    setActiveId(id);
  };

  const handleSave = (data: Omit<Account, 'id' | 'createdAt' | 'isDefault'> & { id?: string }) => {
    saveAccount(data);
    reload();
    // 如果是新建的，设为活跃
    if (!data.id) {
      const all = getAccounts();
      const newest = all[all.length - 1];
      if (newest) setActiveAccount(newest.id);
    }
  };

  const handleDelete = (id: string) => {
    if (accounts.length <= 1) return; // 至少保留一个
    deleteAccount(id);
    setDeleteConfirm(null);
    reload();
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/12 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">账号管理</h1>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">管理多个小红书账号，每个账号独立的数据隔离</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-[var(--text-secondary)]">
              当前活跃账号：<span className="font-medium text-[var(--text-primary)]">{accounts.find(a => a.id === activeId)?.name || '未设置'}</span>
            </p>
            <button className="zen-btn zen-btn-primary" onClick={() => { setEditingAccount(null); setShowModal(true); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新增账号
            </button>
          </div>

          {accounts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[var(--text-muted)] text-sm mb-4">还没有添加任何账号</p>
              <button className="zen-btn zen-btn-primary" onClick={() => { setEditingAccount(null); setShowModal(true); }}>
                添加第一个账号
              </button>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            {accounts.map(account => (
              <div key={account.id}>
                {deleteConfirm === account.id ? (
                  <div className="zen-card p-5 border-[var(--accent-red)]/30">
                    <p className="text-sm mb-3">
                      {accounts.length <= 1
                        ? '至少需要保留一个账号，无法删除。'
                        : `确定删除「${account.name}」？该账号下的素材和草稿也将一并删除。`
                      }
                    </p>
                    <div className="flex gap-2">
                      <button className="zen-btn zen-btn-ghost text-xs flex-1" onClick={() => setDeleteConfirm(null)}>取消</button>
                      {accounts.length > 1 && (
                        <button className="zen-btn text-xs px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--accent-red)] text-white hover:opacity-90" onClick={() => handleDelete(account.id)}>确认删除</button>
                      )}
                    </div>
                  </div>
                ) : (
                  <AccountCard
                    account={account}
                    isActive={account.id === activeId}
                    onActivate={() => handleActivate(account.id)}
                    onEdit={() => { setEditingAccount(account); setShowModal(true); }}
                    onDelete={() => setDeleteConfirm(account.id)}
                  />
                )}
              </div>
            ))}
          </div>

          {accounts.length > 1 && (
            <div className="mt-8 p-5 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border-light)]">
              <p className="text-xs text-[var(--text-muted)]">
                <strong>多账号说明：</strong>不同账号下的素材库、草稿完全隔离。切换账号后，工作台会使用新账号的配置和数据。
                当前活跃账号由顶部导航栏的账号切换器控制。
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {showModal && (
        <AccountModal
          account={editingAccount}
          onClose={() => { setShowModal(false); setEditingAccount(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
