import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export async function POST(req: NextRequest) {
  const { topic } = await req.json();
  if (!topic?.trim()) return NextResponse.json({ error: '内容不能为空' }, { status: 400 });

  const systemPrompt = `你是一个专注于小红书内容运营的爆款标题专家。你擅长为佛法、禅修、心灵成长类内容生成极具吸引力的爆款标题。

输出格式：直接返回JSON数组，不要有其他任何文字，格式如下：
{
  "titles": ["标题1", "标题2", "标题3", ...]
}

必须生成至少15个标题，涵盖以下5种类型，每种至少3个：
1. 悬疑式：制造悬念，引发好奇心
2. 痛点式：直击当代人真实困惑
3. 数字冲击：用数字增强说服力
4. 身份代入：让目标用户感觉"说的就是我"
5. 情绪共鸣：引发强烈情感共鸣

要求：
- 每个标题15~30字之间
- 符合小红书用户阅读习惯
- 具有强烈的小红书爆款特征
- 适合佛法/禅修/心灵成长类账号`;

  const userPrompt = `请为以下内容生成15个爆款标题：

主题：${topic}`;

  if (!DEEPSEEK_API_KEY) {
    const fallback = [
      `法师说：越想放下，越放不下`,
      `打坐三年，我发现了这个秘密`,
      `90%的修行人，都卡在这一步`,
      `为什么你越修越焦虑？`,
      `一个动作，让内心立刻平静`,
      `师父从不外传的3个修行秘诀`,
      `现代人最缺的，不是钱，是这个`,
      `从暴躁到平和：我做对了这5件事`,
      `小红书博主都在偷偷用的禅修技巧`,
      `读完这篇，你会有完全不同的感受`,
      `内心不安？试试这个5分钟方法`,
      `99%的人不知道的修行真相`,
      `不是风动，不是幡动，是你的心在动`,
      `为什么聪明人都在学禅修？`,
      `今天你修行了吗？`,
    ];
    return NextResponse.json({ titles: fallback });
  }

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 1500, temperature: 0.9 }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return NextResponse.json({ titles: parsed.titles || [] });
    }
    throw new Error('无法解析AI返回结果');
  } catch (err) {
    console.error('Title API error:', err);
    const fallback = ['法师说：越想放下，越放不下', '打坐三年，我发现了这个秘密', '90%的人都卡在这一步', '一个动作，让内心立刻平静', '为什么你越修越焦虑？', '师父从不外传的3个修行秘诀', '读完这篇，你会有完全不同的感受', '不是风动，是你的心在动'];
    return NextResponse.json({ titles: fallback });
  }
}
