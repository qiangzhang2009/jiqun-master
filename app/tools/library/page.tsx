'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  getMaterials, deleteMaterial, saveMaterial, searchMaterials,
  getActiveAccount, CATEGORIES, type Material, type MaterialCategory
} from '@/lib/storage';
import { useEffect } from 'react';

const CATEGORY_COLORS: Record<MaterialCategory, string> = {
  '法师讲座': '#8B7355',
  '禅修记录': '#6B8E7A',
  '读书笔记': '#7B8BA3',
  '金句摘录': '#C49A6C',
  '修行感悟': '#8B7B9E',
  '其他': '#9E9E9E',
};

function MaterialCard({ mat, onDelete, onEdit }: {
  mat: Material;
  onDelete: (id: string) => void;
  onEdit: (m: Material) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="zen-card p-5 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${CATEGORY_COLORS[mat.category]}20`, color: CATEGORY_COLORS[mat.category] }}
          >
            {mat.category}
          </span>
          {mat.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
            onClick={() => onEdit(mat)}
            title="编辑"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button
            className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--accent-red)]/10 text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
            onClick={() => onDelete(mat.id)}
            title="删除"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>

      <h3 className="font-medium text-sm mb-2 leading-snug">{mat.title}</h3>
      <p className={`text-xs text-[var(--text-secondary)] leading-relaxed ${!expanded && 'line-clamp-3'}`}>
        {mat.content}
      </p>
      {mat.content.length > 150 && (
        <button
          className="text-xs text-[var(--accent-primary)] mt-1 hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '收起' : '展开全部'}
        </button>
      )}

      <div className="mt-3 pt-3 border-t border-[var(--border-light)] flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          {new Date(mat.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
        </span>
        <div className="flex items-center gap-2">
          {mat.source === 'xhs' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4D4F]/10 text-[#FF4D4F]">小红书</span>
          )}
          <button
            className="text-xs px-3 py-1 rounded-full bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
            onClick={() => {
              const url = new URL(window.location.origin + '/tools/studio');
              url.searchParams.set('material', mat.id);
              window.location.href = url.toString();
            }}
          >
            导入创作
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ mat, onClose, onSave }: {
  mat?: Material | null;
  onClose: () => void;
  onSave: (m: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
}) {
  const [category, setCategory] = useState<MaterialCategory>(mat?.category || '法师讲座');
  const [content, setContent] = useState(mat?.content || '');
  const [tagsInput, setTagsInput] = useState(mat?.tags.join(' ') || '');
  const [title, setTitle] = useState(mat?.title || '');

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      id: mat?.id,
      accountId: mat?.accountId,
      category,
      content,
      tags: tagsInput.split(/[\s,，]+/).map(t => t.trim()).filter(Boolean).slice(0, 10),
      title: title || content.slice(0, 50).replace(/\n/g, ' ').trim(),
      source: mat?.source || 'manual',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="zen-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-serif text-lg font-semibold mb-5">{mat ? '编辑素材' : '新增素材'}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">分类</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    category === cat
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                      : 'border-[var(--border)] hover:border-[var(--accent-light)] text-[var(--text-secondary)]'
                  }`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">标题摘要</label>
            <input
              className="zen-input"
              placeholder="留空则自动从内容前50字生成"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">内容 <span className="text-[var(--accent-red)]">*</span></label>
            <textarea
              className="zen-textarea h-40"
              placeholder="粘贴法师讲座原文、禅修记录、读书笔记……"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">标签（空格或逗号分隔）</label>
            <input
              className="zen-input"
              placeholder="例如：禅修 正念 修行 智慧人生"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button className="zen-btn zen-btn-ghost" onClick={onClose}>取消</button>
          <button
            className="zen-btn zen-btn-primary"
            onClick={handleSave}
            disabled={!content.trim()}
          >
            保存素材
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | '全部'>('全部');
  const [showModal, setShowModal] = useState(false);
  const [editingMat, setEditingMat] = useState<Material | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountId] = useState('');

  useEffect(() => {
    setActiveAccountId(getActiveAccount()?.id || '');
  }, []);

  const reload = useCallback(() => {
    const all = search ? searchMaterials(search) : getMaterials();
    setMaterials(all.filter(m => m.accountId === activeAccountId));
  }, [search, activeAccountId]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!search) {
      setMaterials(getMaterials().filter(m => m.accountId === activeAccountId));
    }
  }, [search, activeAccountId]);

  const filtered = useMemo(() => {
    const list = search ? searchMaterials(search) : getMaterials().filter(m => m.accountId === activeAccountId);
    if (activeCategory === '全部') return list;
    return list.filter(m => m.category === activeCategory);
  }, [search, activeCategory, activeAccountId]);

  const categoryCounts = useMemo(() => {
    const accountMats = getMaterials().filter(m => m.accountId === activeAccountId);
    const counts: Record<string, number> = { '全部': accountMats.length };
    CATEGORIES.forEach(c => { counts[c] = accountMats.filter(m => m.category === c).length; });
    return counts;
  }, [materials.length, activeAccountId]);

  const handleDelete = (id: string) => {
    deleteMaterial(id);
    setDeleteConfirm(null);
    reload();
  };

  const handleSave = (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    saveMaterial({ ...data, accountId: data.accountId || activeAccountId });
    reload();
  };

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-light)]">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-warm)]/12 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warm)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold">素材库</h1>
              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-[var(--accent-warm)]/12 text-[var(--accent-warm)] font-medium">
                {materials.length} 条素材
              </span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">积累禅修内容素材，支持分类管理、搜索和快速导入创作</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* 顶部工具栏 */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            {/* 搜索 */}
            <div className="flex-1 min-w-52">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  className="zen-input pl-9"
                  placeholder="搜索标题、内容、标签……"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* 新增按钮 */}
            <button
              className="zen-btn zen-btn-primary"
              onClick={() => { setEditingMat(null); setShowModal(true); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              新增素材
            </button>
          </div>

          {/* 分类筛选 */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {(['全部', ...CATEGORIES] as const).map(cat => (
              <button
                key={cat}
                className={`text-sm px-4 py-2 rounded-full border transition-all ${
                  activeCategory === cat
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                    : 'border-[var(--border)] hover:border-[var(--accent-light)] text-[var(--text-secondary)]'
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                <span className="ml-1.5 text-xs opacity-60">({categoryCounts[cat] || 0})</span>
              </button>
            ))}
          </div>

          {/* 空状态 */}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <svg className="mx-auto mb-4 text-[var(--text-muted)]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <p className="text-[var(--text-muted)] text-sm">
                {search ? '没有找到匹配的素材' : activeCategory !== '全部' ? `还没有${activeCategory}类素材` : '素材库为空，开始积累吧'}
              </p>
              {!search && (
                <button className="mt-4 zen-btn zen-btn-primary" onClick={() => { setEditingMat(null); setShowModal(true); }}>
                  添加第一条素材
                </button>
              )}
            </div>
          )}

          {/* 素材列表 */}
          {filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(mat => (
                <div key={mat.id}>
                  {deleteConfirm === mat.id ? (
                    <div className="zen-card p-5 border-[var(--accent-red)]/30">
                      <p className="text-sm mb-3">确定删除这条素材吗？</p>
                      <div className="flex items-center gap-2">
                        <button className="zen-btn zen-btn-ghost text-xs flex-1" onClick={() => setDeleteConfirm(null)}>取消</button>
                        <button className="zen-btn text-xs px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--accent-red)] text-white hover:opacity-90" onClick={() => handleDelete(mat.id)}>确认删除</button>
                      </div>
                    </div>
                  ) : (
                    <MaterialCard
                      mat={mat}
                      onDelete={id => setDeleteConfirm(id)}
                      onEdit={m => { setEditingMat(m); setShowModal(true); }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {showModal && (
        <EditModal
          mat={editingMat}
          onClose={() => { setShowModal(false); setEditingMat(null); }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
