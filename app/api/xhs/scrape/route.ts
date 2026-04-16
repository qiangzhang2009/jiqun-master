import { NextRequest, NextResponse } from 'next/server';

const XHS_BASE_URLS = [
  'https://www.xiaohongshu.com',
  'https://xhslink.com',
];

function isXHSUrl(url: string): boolean {
  return XHS_BASE_URLS.some(base => url.includes(base));
}

function extractXHSInfo(url: string): { type: 'profile' | 'note' | 'unknown'; userId?: string; noteId?: string } {
  try {
    const u = new URL(url);

    // 笔记详情页：/discovery/item/:noteId
    const noteMatch = u.pathname.match(/\/discovery\/item\/([a-zA-Z0-9]+)/);
    if (noteMatch) {
      return { type: 'note', noteId: noteMatch[1] };
    }

    // 用户主页：/user/profile/:userId
    const profileMatch = u.pathname.match(/\/user\/profile\/([a-zA-Z0-9]+)/);
    if (profileMatch) {
      return { type: 'profile', userId: profileMatch[1] };
    }

    // 短链接：xhslink.com → 重定向处理
    if (u.hostname === 'xhslink.com') {
      return { type: 'unknown' };
    }

    return { type: 'unknown' };
  } catch {
    return { type: 'unknown' };
  }
}

async function fetchXHSContent(url: string): Promise<string> {
  const headers = {
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
    'Referer': 'https://www.xiaohongshu.com/',
  };

  const response = await fetch(url, {
    headers,
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.text();
}

function parseNoteFromHTML(html: string): {
  title: string;
  content: string;
  author: string;
  likes: string;
  collected: string;
} | null {
  try {
    // 尝试从 __INITIAL_SSR_STATE__ 或 window.__INITIAL_STATE__ 中提取数据
    const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});?\s*<\/script>/s);

    if (stateMatch) {
      // 提取 JSON 数据（可能需要解码 HTML 实体）
      const jsonStr = stateMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n');

      // 找到笔记正文
      const noteContentMatch = jsonStr.match(/"desc"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
      const noteTitleMatch = jsonStr.match(/"title"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
      const authorMatch = jsonStr.match(/"nickname"\s*:\s*"([^"]*)"/);
      const likeMatch = jsonStr.match(/"likedCount"\s*:\s*(\d+)/);
      const collectMatch = jsonStr.match(/"collectedCount"\s*:\s*(\d+)/);

      const content = noteContentMatch
        ? decodeHTMLEntities(noteContentMatch[1])
        : '';
      const title = noteTitleMatch ? decodeHTMLEntities(noteTitleMatch[1]) : '';
      const author = authorMatch ? authorMatch[1] : '';

      if (content || title) {
        return {
          title: title || content.slice(0, 30),
          content: content,
          author: author,
          likes: likeMatch ? likeMatch[1] : '',
          collected: collectMatch ? collectMatch[1] : '',
        };
      }
    }

    // 备用：从 og:description 或 meta 标签提取
    const ogDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);

    if (ogDescMatch || ogTitleMatch) {
      return {
        title: ogTitleMatch ? decodeHTMLEntities(ogTitleMatch[1]) : '',
        content: ogDescMatch ? decodeHTMLEntities(ogDescMatch[1]) : '',
        author: '',
        likes: '',
        collected: '',
      };
    }

    return null;
  } catch {
    return null;
  }
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\\u([a-fA-F0-9]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t');
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url?.trim()) {
    return NextResponse.json({ error: 'URL 不能为空' }, { status: 400 });
  }

  if (!isXHSUrl(url)) {
    return NextResponse.json({ error: '请输入有效的小红书链接（支持 xiaohongshu.com 或 xhslink.com）' }, { status: 400 });
  }

  const info = extractXHSInfo(url);

  if (info.type === 'unknown' && url.includes('xhslink.com')) {
    return NextResponse.json({
      error: '短链接需要先在浏览器中打开，然后分享详情页链接',
      hint: '请在微信/小红书App中打开xhslink.com链接，复制详情页URL（包含/user/profile或/discovery/item的链接）粘贴到这里',
    }, { status: 400 });
  }

  if (info.type === 'profile') {
    return NextResponse.json({
      error: '用户主页链接暂不支持自动采集',
      hint: '请分享单篇笔记链接（包含 /discovery/item/ 的URL），系统会抓取该笔记的内容作为创作素材',
      info: {
        type: 'profile',
        userId: info.userId,
      },
    }, { status: 400 });
  }

  try {
    const html = await fetchXHSContent(url);
    const noteData = parseNoteFromHTML(html);

    if (!noteData) {
      return NextResponse.json({
        error: '未能解析笔记内容',
        hint: '小红书可能需要登录才能查看完整内容。请复制笔记正文粘贴到素材框中，或分享另一篇笔记链接',
      }, { status: 422 });
    }

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
      // 合成完整素材文本
      material: buildMaterialText(noteData),
    });
  } catch (err) {
    console.error('XHS fetch error:', err);
    return NextResponse.json({
      error: '抓取失败',
      hint: '小红书有反爬机制，付费笔记和登录可见内容无法抓取。请直接复制笔记正文粘贴到素材框中',
    }, { status: 500 });
  }
}

function buildMaterialText(data: {
  title: string;
  content: string;
  author: string;
  likes: string;
  collected: string;
}): string {
  const parts: string[] = [];

  if (data.title) {
    parts.push(`【笔记标题】${data.title}`);
  }

  if (data.author) {
    parts.push(`【作者】${data.author}`);
  }

  if (data.content) {
    parts.push(`【正文内容】\n${data.content}`);
  }

  if (data.likes || data.collected) {
    const stats: string[] = [];
    if (data.likes) stats.push(`获赞 ${data.likes}`);
    if (data.collected) stats.push(`收藏 ${data.collected}`);
    parts.push(`【互动数据】${stats.join(' · ')}`);
  }

  parts.push('\n---');
  parts.push('以上内容采集自小红书，可作为创作参考素材。');

  return parts.join('\n\n');
}
