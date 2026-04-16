import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: '内容不能为空' }, { status: 400 });

  const systemPrompt = `你是一个专注于小红书标签运营的专家，特别擅长为佛法、禅修、心灵成长类内容推荐标签。

输出格式：直接返回JSON，不要有任何其他文字：
{
  "tags": ["#标签1", "#标签2", "#标签3", ...]
}

标签组合要求：
- 3~5个核心标签（高流量、垂直精准，如 #禅修 #修行 #佛法）
- 2~3个长尾标签（精准、有深度竞争壁垒，如 #职场内耗 #当代修行）
- 1个热门标签（蹭热度用，选取当前小红书热门话题相关）

要求：
- 总共6~10个标签
- 标签必须真实存在于小红书平台
- 标签顺序按重要性排列
- 不要包含空格或特殊字符`;

  const userPrompt = `请为以下内容推荐最优标签组合：

内容：${content}`;

  if (!DEEPSEEK_API_KEY) {
    const fallback = [
      '#佛法', '#禅修', '#心灵成长', '#正念', '#自我觉察',
      '#智慧人生', '#修行', '#当代年轻人', '#焦虑', '#内心平静',
    ];
    return NextResponse.json({ tags: fallback });
  }

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 500, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return NextResponse.json({ tags: parsed.tags || [] });
    }
    throw new Error('无法解析');
  } catch (err) {
    console.error('Tags API error:', err);
    return NextResponse.json({
      tags: ['#佛法', '#禅修', '#心灵成长', '#正念', '#自我觉察', '#智慧人生', '#修行', '#当代年轻人'],
    });
  }
}
