// ─────────────────────────────────────────
// 全局存储层 — localStorage 统一管理
// 所有持久化数据通过本模块读写
// ─────────────────────────────────────────

export type MaterialCategory = '法师讲座' | '禅修记录' | '读书笔记' | '金句摘录' | '修行感悟' | '其他';

export type Material = {
  id: string;
  accountId: string;      // 关联的账号ID
  category: MaterialCategory;
  title: string;          // 素材标题/摘要（自动生成前50字）
  content: string;        // 完整内容
  tags: string[];         // 用户打的标签
  createdAt: number;      // timestamp
  updatedAt: number;
  source?: 'manual' | 'xhs';  // 来源
  noteId?: string;        // 小红书笔记ID（如果有）
};

export type Account = {
  id: string;
  name: string;           // 显示名称，如"静心小院"
  type: '法师/僧人' | '禅修道场/寺院' | '居士/义工' | '读书会/共修小组' | '传统文化/心灵成长' | '其他';
  audience: string;       // 目标受众描述
  postsPerWeek: string;   // 发布频率
  goal: string;           // 运营目标
  createdAt: number;
  isDefault: boolean;
};

export type Draft = {
  id: string;
  accountId: string;
  sourceText: string;
  translatedText: string;
  selectedTitle: string;
  tags: string[];
  posterQuote: string;
  checkResult: { score: number; issues: Array<{ word: string; replacement?: string }> } | null;
  finalDraft: string;
  createdAt: number;
  status: 'drafting' | 'published' | 'archived';
  publishedAt?: number;
  // 复盘数据
  reviewData?: ReviewData;
};

export type ReviewData = {
  views?: number;
  likes?: number;
  collects?: number;
  comments?: number;
  sharedByUser?: string;  // 用户自己填写的复盘备注
};

// ─── Storage Keys ───
const KEYS = {
  ACCOUNTS: 'zenjing_accounts',
  ACTIVE_ACCOUNT: 'zenjing_active_account',
  MATERIALS: 'zenjing_materials',
  DRAFTS: 'zenjing_drafts',
} as const;

// ─── Account Operations ───
export function getAccounts(): Account[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEYS.ACCOUNTS) || '[]');
  } catch { return []; }
}

export function getActiveAccount(): Account | null {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem(KEYS.ACTIVE_ACCOUNT);
  if (!id) {
    const accounts = getAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }
  return getAccounts().find(a => a.id === id) || null;
}

export function setActiveAccount(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.ACTIVE_ACCOUNT, id);
}

export function saveAccount(account: Omit<Account, 'id' | 'createdAt'> & { id?: string }): Account {
  const accounts = getAccounts();
  const now = Date.now();
  if (account.id) {
    // 更新
    const idx = accounts.findIndex(a => a.id === account.id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...account, updatedAt: now } as Account;
      const updated = accounts[idx];
      localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
      return updated;
    }
  }
  // 新建
  const newAccount: Account = {
    ...account,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    isDefault: accounts.length === 0,
  } as Account;
  accounts.push(newAccount);
  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  return newAccount;
}

export function deleteAccount(id: string): void {
  const accounts = getAccounts().filter(a => a.id !== id);
  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts));
  // 如果删除了当前活跃账号，切换到第一个
  const active = localStorage.getItem(KEYS.ACTIVE_ACCOUNT);
  if (active === id) {
    localStorage.setItem(KEYS.ACTIVE_ACCOUNT, accounts[0]?.id || '');
  }
  // 同时删除该账号下的素材和草稿
  const mats = getMaterials().filter(m => m.accountId !== id);
  localStorage.setItem(KEYS.MATERIALS, JSON.stringify(mats));
  const drafts = getDrafts().filter(d => d.accountId !== id);
  localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
}

// ─── Material Operations ───
export function getMaterials(): Material[] {
  if (typeof window === 'undefined') return [];
  try {
    const mats = JSON.parse(localStorage.getItem(KEYS.MATERIALS) || '[]');
    return mats.sort((a: Material, b: Material) => b.updatedAt - a.updatedAt);
  } catch { return []; }
}

export function getMaterialsByCategory(category: MaterialCategory): Material[] {
  return getMaterials().filter(m => m.category === category);
}

export function searchMaterials(query: string): Material[] {
  const q = query.toLowerCase();
  return getMaterials().filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.content.toLowerCase().includes(q) ||
    m.tags.some(t => t.toLowerCase().includes(q))
  );
}

export function saveMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Material {
  const materials = getMaterials();
  const now = Date.now();
  if (material.id) {
    const idx = materials.findIndex(m => m.id === material.id);
    if (idx !== -1) {
      materials[idx] = { ...materials[idx], ...material, updatedAt: now } as Material;
      localStorage.setItem(KEYS.MATERIALS, JSON.stringify(materials));
      return materials[idx];
    }
  }
  const newMat: Material = {
    ...material,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  } as Material;
  materials.unshift(newMat);
  localStorage.setItem(KEYS.MATERIALS, JSON.stringify(materials));
  return newMat;
}

export function deleteMaterial(id: string): void {
  const materials = getMaterials().filter(m => m.id !== id);
  localStorage.setItem(KEYS.MATERIALS, JSON.stringify(materials));
}

// ─── Draft Operations ───
export function getDrafts(): Draft[] {
  if (typeof window === 'undefined') return [];
  try {
    const drafts = JSON.parse(localStorage.getItem(KEYS.DRAFTS) || '[]');
    return drafts.sort((a: Draft, b: Draft) => b.createdAt - a.createdAt);
  } catch { return []; }
}

export function getDraftsByAccount(accountId: string): Draft[] {
  return getDrafts().filter(d => d.accountId === accountId);
}

export function saveDraft(draft: Omit<Draft, 'id' | 'createdAt'> & { id?: string }): Draft {
  const drafts = getDrafts();
  const now = Date.now();
  if (draft.id) {
    const idx = drafts.findIndex(d => d.id === draft.id);
    if (idx !== -1) {
      drafts[idx] = { ...drafts[idx], ...draft, updatedAt: now } as Draft;
      localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
      return drafts[idx];
    }
  }
  const newDraft: Draft = {
    ...draft,
    id: crypto.randomUUID(),
    createdAt: now,
  } as Draft;
  drafts.unshift(newDraft);
  localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
  return newDraft;
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts().filter(d => d.id !== id);
  localStorage.setItem(KEYS.DRAFTS, JSON.stringify(drafts));
}

// ─── Utility ───
export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export function generateTitle(content: string): string {
  return content.slice(0, 50).replace(/\n/g, ' ').trim() + (content.length > 50 ? '…' : '');
}

export const CATEGORIES: MaterialCategory[] = [
  '法师讲座', '禅修记录', '读书笔记', '金句摘录', '修行感悟', '其他',
];
