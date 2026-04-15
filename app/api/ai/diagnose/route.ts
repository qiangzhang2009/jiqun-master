import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export async function POST(req: NextRequest) {
  const { accountType, contentType, targetAudience, postsPerWeek, goal } = await req.json();

  const systemPrompt = `你是一个专注于小红书平台运营的专家，特别擅长佛学、传统文化、心灵成长类账号的诊断和优化。请根据用户提供的账号信息，给出专业、具体、可操作的诊断报告。

输出格式为JSON，必须包含以下字段：
{
  "clarity": 数字(0-100)，定位清晰度评分
  "warmth": 数字(0-100)，人设温度评分
  "differentiation": 数字(0-100)，差异化指数评分
  "clarityAdvice": 字符串数组，3条定位优化建议
  "warmAdvice": 字符串数组，3条人设优化建议
  "diffAdvice": 字符串数组，3条差异化建议
  "overall": 字符串，综合评价（1~2句话）
}

评分标准：
- 80-100：优秀
- 60-79：良好，有提升空间
- 40-59：一般，需要重点优化
- 0-39：较差，需要重新定位

建议要具体、可操作，避免泛泛而谈。`;

  const userPrompt = `请诊断以下小红书账号：

- 账号类型：${accountType || '未填写'}
- 内容形式：${contentType || '未填写'}
- 目标受众：${targetAudience || '未填写'}
- 发布频率：${postsPerWeek || '未填写'}
- 运营目标：${goal || '未填写'}

请给出三维诊断报告，特别关注：
1. 该类型账号在小红书上的定位是否清晰
2. 佛法弘法内容如何在小红书上保持"人设温度"
3. 如何在众多心灵成长账号中建立差异化`;

  const fallback = getRuleBasedDiagnosis({ accountType, contentType, targetAudience, postsPerWeek, goal });

  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ result: fallback, usingFallback: true });
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
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
      const result = JSON.parse(content);
      return NextResponse.json({ result });
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ result });
      }
      throw new Error('无法解析AI返回结果');
    }
  } catch (err) {
    console.error('Diagnose API error:', err);
    return NextResponse.json({ result: fallback, usingFallback: true });
  }
}

function getRuleBasedDiagnosis(params: {
  accountType: string; contentType: string; targetAudience: string; postsPerWeek: string; goal: string;
}) {
  const { accountType, contentType, postsPerWeek } = params;

  let clarity = 60, warmth = 55, diff = 65;

  if (accountType === '法师/僧人') warmth = Math.min(100, warmth + 20);
  if (contentType === '金句图文') clarity = Math.min(100, clarity + 15);
  if (contentType === '讲座视频') { clarity = Math.min(100, clarity - 10); warmth = Math.min(100, warmth + 5); }
  if (postsPerWeek === '不足1篇') { clarity = Math.max(0, clarity - 20); diff = Math.max(0, diff - 15); }

  const overall = clarity < 60
    ? '账号定位需要进一步明确，建议先梳理清楚「我是谁、我服务谁、我的独特价值是什么」这三个问题。'
    : warmth < 60
    ? '内容有专业度，但在「人设温度」上需要加强，建议增加更多个人故事和真实感受的表达。'
    : '账号整体定位清晰，可进一步优化差异化表达，在众多同类账号中建立独特记忆点。';

  return {
    clarity,
    warmth,
    differentiation: diff,
    clarityAdvice: [
      '明确账号的核心价值主张：您的账号为哪类人群解决什么问题？',
      '保持内容垂直度，避免内容过于分散导致标签模糊',
      '设计清晰的「人设故事线」，让用户快速理解账号定位',
    ],
    warmAdvice: [
      '在每篇内容中加入个人经历或真实感悟，让内容有温度',
      '法师/机构账号建议有固定出镜人，避免纯内容堆砌',
      '评论区互动要体现人格化，不要用过于官方的语言',
    ],
    diffAdvice: [
      '深耕一个细分领域（如「职场人的佛法修行」），避免泛泛而谈',
      '挖掘独特的弘法理念，形成差异化内容壁垒',
      '建立账号独特的视觉风格和语言风格，形成辨识度',
    ],
    overall,
  };
}
