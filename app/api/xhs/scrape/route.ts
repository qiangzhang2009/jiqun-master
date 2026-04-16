import { NextRequest, NextResponse } from 'next/server';

const XHS_NOTE_PATTERNS = ['xiaohongshu.com/discovery/item/', 'xhslink.com'];

function isXHSUrl(url: string): boolean {
  return XHS_NOTE_PATTERNS.some(p => url.includes(p));
}

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
    },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function extractUserId(url: string): string | null {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/user\/profile\/([a-zA-Z0-9]+)/);
    return m ? m[1] : null;
  } catch { return null; }
}

function extractNoteIdsFromProfile(html: string): string[] {
  // 方法1：提取 __INITIAL_STATE__ 中的笔记ID列表
  const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});?\s*<\/script>/s);
  if (stateMatch) {
    const jsonStr = decodeHTMLEntities(stateMatch[1]);
    const ids: string[] = [];
    // 匹配 noteId 字段
    const noteIdMatches = jsonStr.matchAll(/"noteId"\s*:\s*"([a-zA-Z0-9]+)"/g);
    for (const m of noteIdMatches) {
      if (!ids.includes(m[1])) ids.push(m[1]);
    }
    if (ids.length > 0) return ids.slice(0, 20); // 最多20篇
  }
  // 方法2：直接从HTML中找discovery/item链接
  const linkMatches = html.matchAll(/xiaohongshu\.com\/discovery\/item\/([a-zA-Z0-9]+)/g);
  const ids: string[] = [];
  for (const m of linkMatches) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  return ids.slice(0, 20);
}

function parseNoteFromHTML(html: string): {
  title: string; content: string; author: string; likes: string; collected: string;
} | null {
  try {
    const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});?\s*<\/script>/s);
    if (stateMatch) {
      const jsonStr = decodeHTMLEntities(stateMatch[1]);
      // 提取 desc（正文）
      const descMatch = jsonStr.match(/"desc"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      // 提取 title
      const titleMatch = jsonStr.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      // 提取 nickname
      const nickMatch = jsonStr.match(/"nickname"\s*:\s*"([^"]*)"/);
      // 提取点赞/收藏
      const likeMatch = jsonStr.match(/"likedCount"\s*:\s*(\d+)/);
      const collMatch = jsonStr.match(/"collectedCount"\s*:\s*(\d+)/);

      const content = descMatch ? descMatch[1] : '';
      const title = titleMatch ? titleMatch[1] : '';

      if (content || title) {
        return {
          title: title || content.slice(0, 30),
          content,
          author: nickMatch ? nickMatch[1] : '',
          likes: likeMatch ? likeMatch[1] : '',
          collected: collMatch ? collMatch[1] : '',
        };
      }
    }
    // 备用：og:description
    const ogDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
    const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);
    if (ogDesc || ogTitle) {
      return {
        title: ogTitle ? decodeHTMLEntities(ogTitle[1]) : '',
        content: ogDesc ? decodeHTMLEntities(ogDesc[1]) : '',
        author: '', likes: '', collected: '',
      };
    }
    return null;
  } catch { return null; }
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
    .replace(/\\u([a-fA-F0-9]{4})/g, (_, c) => String.fromCharCode(parseInt(c, 16)))
    .replace(/\\n/g, '\n').replace(/\\r/g, '\r');
}

function buildNoteMaterial(note: { title: string; content: string; author: string; likes: string; collected: string; index: number }): string {
  const parts: string[] = [];
  parts.push(`【笔记 ${note.index}】`);
  if (note.title) parts.push(`标题：${note.title}`);
  if (note.content) parts.push(`正文：\n${note.content}`);
  if (note.author) parts.push(`作者：${note.author}`);
  if (note.likes || note.collected) {
    const stats: string[] = [];
    if (note.likes) stats.push(`获赞 ${note.likes}`);
    if (note.collected) stats.push(`收藏 ${note.collected}`);
    parts.push(`互动：${stats.join(' · ')}`);
  }
  return parts.join('\n');
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url?.trim()) {
    return NextResponse.json({ error: 'URL 不能为空' }, { status: 400 });
  }

  if (!isXHSUrl(url)) {
    return NextResponse.json({
      error: '请输入有效的小红书链接',
      hint: '支持笔记详情页（包含 /discovery/item/）或用户主页（包含 /user/profile/）',
    }, { status: 400 });
  }

  // ── 处理用户主页链接 ──
  if (url.includes('/user/profile/') && !url.includes('/discovery/item/')) {
    try {
      const userId = extractUserId(url);
      if (!userId) {
        return NextResponse.json({ error: '无法解析用户主页链接' }, { status: 400 });
      }

      const html = await fetchHTML(url);
      const noteIds = extractNoteIdsFromProfile(html);

      if (noteIds.length === 0) {
        return NextResponse.json({
          error: '未能从主页提取到笔记',
          hint: '该账号可能没有公开笔记，或需要登录才能查看。请尝试粘贴单篇笔记详情页链接。',
        }, { status: 422 });
      }

      // 最多并行抓取6篇，避免超时
      const limitedIds = noteIds.slice(0, 6);
      const results: string[] = [];

      // 并行抓取所有笔记
      await Promise.allSettled(
        limitedIds.map(async (noteId, idx) => {
          try {
            const noteUrl = `https://www.xiaohongshu.com/discovery/item/${noteId}`;
            const noteHTML = await fetchHTML(noteUrl);
            const noteData = parseNoteFromHTML(noteHTML);
            if (noteData && (noteData.content || noteData.title)) {
              results.push(buildNoteMaterial({ ...noteData, index: idx + 1 }));
            }
          } catch { /* 忽略单个笔记的错误 */ }
        })
      );

      if (results.length === 0) {
        return NextResponse.json({
          error: '未能抓取到任何笔记内容',
          hint: '小红书有反爬限制，批量抓取可能失败。建议直接复制笔记正文粘贴到素材框中。',
        }, { status: 422 });
      }

      const materialText = results.join('\n\n' + '─'.repeat(30) + '\n\n');

      return NextResponse.json({
        success: true,
        type: 'profile',
        url,
        userId,
        noteCount: results.length,
        data: { notes: results },
        material: materialText,
        hint: `已从主页提取 ${results.length} 篇笔记内容，自动填入下方素材框`,
      });
    } catch (err) {
      console.error('XHS profile scrape error:', err);
      return NextResponse.json({
        error: '主页抓取失败',
        hint: '小红书有反爬机制，建议直接复制笔记正文粘贴到素材框中',
      }, { status: 500 });
    }
  }

  // ── 处理笔记详情页链接 ──
  if (url.includes('/discovery/item/')) {
    try {
      const html = await fetchHTML(url);
      const noteData = parseNoteFromHTML(html);

      if (!noteData || (!noteData.content && !noteData.title)) {
        return NextResponse.json({
          error: '未能解析笔记内容',
          hint: '这篇笔记可能需要登录才能查看。请直接复制正文粘贴到素材框中。',
        }, { status: 422 });
      }

      const materialText = [
        noteData.title ? `标题：${noteData.title}` : '',
        noteData.content ? `正文：\n${noteData.content}` : '',
        noteData.author ? `作者：${noteData.author}` : '',
        (noteData.likes || noteData.collected)
          ? `互动：${[noteData.likes ? `获赞 ${noteData.likes}` : '', noteData.collects ? `收藏 ${noteData.collects}` : ''].filter(Boolean).join(' · ')}`
          : '',
      ].filter(Boolean).join('\n\n');

      return NextResponse.json({
        success: true,
        type: 'note',
        url,
        data: {
          title: noteData.title,
          content: noteData.content,
          author: noteData.author,
          likes: noteData.likes,
          collected: noteData.collected,
        },
        material: materialText,
      });
    } catch (err) {
      console.error('XHS note scrape error:', err);
      return NextResponse.json({
        error: '抓取失败',
        hint: '小红书有反爬限制。建议直接复制笔记正文粘贴到素材框中。',
      }, { status: 500 });
    }
  }

  // 短链接处理
  if (url.includes('xhslink.com')) {
    return NextResponse.json({
      error: '短链接需要先在浏览器中打开',
      hint: '请在微信或小红书App中打开短链接，然后复制详情页URL（包含 /discovery/item/ 或 /user/profile/）粘贴到这里',
    }, { status: 400 });
  }

  return NextResponse.json({ error: '无法识别的链接格式' }, { status: 400 });
}
