import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export async function POST(req: NextRequest) {
  const { title, body, tags, posterQuote } = await req.json();

  if (!title?.trim() && !body?.trim()) {
    return NextResponse.json({ error: '标题和正文不能同时为空' }, { status: 400 });
  }

  const systemPrompt = `你是一个专业的小红书内容编辑，擅长将散乱的内容素材整合成一篇结构完整、发布级别的图文笔记。

你的任务是把已有的标题、正文、标签，整合成一份"可以直接复制粘贴发布"的终稿。

输出要求：
- 标题：直接使用用户提供的标题，或微调优化
- 正文：在原文中补充emoji、段落结构、小标题，让阅读体验更好
- 标签：使用用户提供的标签，加上2~3个补充标签
- 格式：Markdown格式，分段清晰
- 开头：前3行必须有强钩子，让人想继续读
- 结尾：加1~2句引导互动的话（不要直接说"评论区见"，要自然）
- 字数：正文控制在300~600字（图文笔记）

最终输出格式：
【标题】
[标题内容]

【正文】
[正文内容]

【标签】
[标签1] [标签2] [标签3]...

【封面文字建议】
[一行封面金句，15~30字，直接可以用在封面图上]

注意：
- 不要虚构任何内容，只在原文基础上优化结构和表达
- 保持佛法/禅修内容的核心义理不变
- 标签格式为 #标签名，不要加空格`;

  const userPrompt = `请整合以下素材，生成可发布的终稿：

标题：
${title || '(未提供，使用正文主题自拟)'}

正文：
${body || '(未提供)'}

已选标签：
${tags?.length > 0 ? tags.join(' ') : '(未提供)'}

封面金句（可选）：
${posterQuote || '(未提供，使用标题)'}`;

  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: '请先配置 DeepSeek API Key' }, { status: 500 });
  }

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.75,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ result });
  } catch (err) {
    console.error('Final draft API error:', err);
    return NextResponse.json({ error: '生成失败，请稍后重试' }, { status: 500 });
  }
}
