import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export async function POST(req: NextRequest) {
  const { text, mode } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
  }

  const modeLabels: Record<string, string> = {
    light: '轻量笔记（200~400字小红书图文风格）',
    gold: '金句图文（提取3~5条精华金句，每条10~30字，适合「墨境」使用）',
    expand: '选题扩展（从内容中提取3个可独立成篇的选题，每个包含标题+核心观点+目标受众）',
  };

  const modeDesc = modeLabels[mode] || modeLabels.light;

  const systemPrompt = `你是一个专注于小红书内容运营的专家，擅长将佛法、传统文化内容转化为小红书用户能理解的语言。

核心原则：
1. 保留佛法核心观点，不能曲解或简化核心义理
2. 将学术化/寺院化的表达转化为现代人熟悉的生活语言
3. 使用当代年轻人能产生共鸣的表达方式（可以适当用"emo"、"内耗"、"治愈"等流行语）
4. 标题要有钩子，正文要结构清晰，适合手机阅读
5. 字数控制在合理范围内，图文笔记300~600字，金句10~30字每条

输出格式：
- 轻量笔记：标题 + 正文（带emoji和段落结构）
- 金句图文：编号列表，每条金句10~30字
- 选题扩展：编号列表，每条包含标题、核心观点、一句话推荐语`;

  const userPrompt = `请将以下法师讲座内容转化为小红书风格的${modeDesc}：

---
${text}
---

要求：
- 轻量笔记：保留1个核心佛学概念，用生活化的例子解释
- 金句图文：选取最有冲击力/共鸣感的句子，保留原意
- 选题扩展：每个选题要贴合当代人真实困惑（如职场内耗、情感困惑、自我怀疑等）`;

  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({
      error: 'DEEPSEEK_API_KEY 未配置',
      fallback: getRuleBasedResult(text, mode),
    }, { status: 200 });
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
        temperature: 0.8,
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
    console.error('Translate API error:', err);
    return NextResponse.json({
      error: 'AI服务暂时不可用',
      fallback: getRuleBasedResult(text, mode),
    }, { status: 200 });
  }
}

function getRuleBasedResult(text: string, mode: string): string {
  if (mode === 'gold') {
    return `【金句提取 - 规则引擎兜底版本】

基于内容分析的简单提取：

1. "${text.slice(0, 30)}……"

提示：配置 DEEPSEEK_API_KEY 环境变量可获得AI精准翻译服务。`;
  }
  if (mode === 'expand') {
    return `【选题扩展 - 规则引擎兜底版本】

基于内容分析，可能适合以下选题方向：
- 如何将佛法智慧应用到日常生活
- 从法师观点看现代人的精神困惑
- 修行入门：从理解到实践

提示：配置 DEEPSEEK_API_KEY 环境变量可获得AI选题分析服务。`;
  }
  return `【轻量笔记 - 规则引擎兜底版本】

标题建议：法师开示：${text.slice(0, 20)}……

正文（需人工润色）：
${text.slice(0, 200)}${text.length > 200 ? '……' : ''}

提示：配置 DEEPSEEK_API_KEY 环境变量可获得完整AI翻译服务。`;
}
