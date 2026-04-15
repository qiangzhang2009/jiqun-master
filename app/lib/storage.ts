'use client';

/**
 * 统一的 localStorage 持久化层
 * 自动处理 SSR（服务端渲染）环境下的 window 访问问题
 */

// --- 通用工具 ---

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function safeGet<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function safeRemove(key: string): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// --- 存储 Key 定义 ---

export const STORAGE_KEYS = {
  CALENDAR_ITEMS: 'zenjing_calendar_items',
  TRANSLATE_DRAFT: 'zenjing_translate_draft',
  CHECK_DRAFT: 'zenjing_check_draft',
} as const;

// --- 日历内容持久化 ---

export type StoredContentItem = {
  id: string;
  title: string;
  tags: string;
  time: string;      // "HH:mm"
  date: string;      // "YYYY-MM-DD"
  status: 'draft' | 'scheduled' | 'published';
  note?: string;
  createdAt: string; // ISO timestamp
};

export function loadCalendarItems(): StoredContentItem[] {
  return safeGet<StoredContentItem[]>(STORAGE_KEYS.CALENDAR_ITEMS, []);
}

export function saveCalendarItems(items: StoredContentItem[]): void {
  safeSet(STORAGE_KEYS.CALENDAR_ITEMS, items);
}

export function addCalendarItem(item: Omit<StoredContentItem, 'id' | 'createdAt'>): StoredContentItem {
  const newItem: StoredContentItem = {
    ...item,
    id: `cal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const items = loadCalendarItems();
  saveCalendarItems([...items, newItem]);
  return newItem;
}

export function deleteCalendarItem(id: string): void {
  const items = loadCalendarItems();
  saveCalendarItems(items.filter(i => i.id !== id));
}

export function updateCalendarItem(id: string, updates: Partial<StoredContentItem>): void {
  const items = loadCalendarItems();
  saveCalendarItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
}

// --- 翻译草稿持久化 ---

export type TranslateDraft = {
  input: string;
  mode: 'light' | 'gold' | 'expand';
  output: string;
  savedAt: string; // ISO timestamp
};

export function loadTranslateDraft(): TranslateDraft | null {
  return safeGet<TranslateDraft | null>(STORAGE_KEYS.TRANSLATE_DRAFT, null);
}

export function saveTranslateDraft(draft: TranslateDraft): void {
  safeSet(STORAGE_KEYS.TRANSLATE_DRAFT, draft);
}

export function clearTranslateDraft(): void {
  safeRemove(STORAGE_KEYS.TRANSLATE_DRAFT);
}

// --- 净言草稿持久化 ---

export type CheckDraft = {
  input: string;
  savedAt: string;
};

export function loadCheckDraft(): CheckDraft | null {
  return safeGet<CheckDraft | null>(STORAGE_KEYS.CHECK_DRAFT, null);
}

export function saveCheckDraft(input: string): void {
  safeSet(STORAGE_KEYS.CHECK_DRAFT, { input, savedAt: new Date().toISOString() });
}

export function clearCheckDraft(): void {
  safeRemove(STORAGE_KEYS.CHECK_DRAFT);
}
