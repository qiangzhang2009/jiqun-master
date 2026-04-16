import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export async function POST(req: NextRequest) {
  const { accountType, contentType, targetAudience, postsPerWeek, goal, accountName } = await req.json();

  const systemPrompt = `你是一个专注于小红书平台运营的专家，特别擅长佛学、禅修、道场、心灵成长类账号的诊断和优化。你对中国传统文化、佛法修行有深刻理解，能给出既专业又接地气的建议。

输出格式为JSON，必须包含以下字段：
{
  "clarity": 数字(0-100)，定位清晰度评分
  "warmth": 数字(0-100)，人设温度评分
  "differentiation": 数字(0-100)，差异化指数评分
  "overall": 字符串，综合评价（2~3句话，要具体，不要泛泛而谈）
  "clarityAdvice": 字符串数组，3条定位优化建议（要具体到"做什么、怎么做"）
  "warmAdvice": 字符串数组，3条人设优化建议（要具体到内容形式、表达风格、互动方式）
  "diffAdvice": 字符串数组，3条差异化建议（要具体到差异化定位、独特记忆点、内容壁垒）
  "quickWins": 字符串数组，2~3个立刻能做的快速见效行动（每条不超过15字）
  "recommendedTags": 字符串数组，5个最适合该账号的标签
}

评分标准：
- 80-100：优秀，该类型账号中的佼佼者
- 60-79：良好，有明显提升空间
- 40-59：一般，需要重点优化
- 0-39：较差，需要重新定位

特别要求：
- 建议要具体、可操作，避免"多发内容、多和粉丝互动"这类泛泛而谈的废话
- 要结合佛法/禅修/道场的特殊性给出建议
- quickWins 必须是当天就能执行的简单行动`;

  const userPrompt = `请诊断以下小红书账号：

- 账号名称：${accountName || '未填写'}
- 账号类型：${accountType || '未填写'}
- 内容形式：${contentType || '未填写'}
- 目标受众：${targetAudience || '未填写'}
- 发布频率：${postsPerWeek || '未填写'}
- 运营目标：${goal || '未填写'}

请给出三维诊断报告，特别关注：
1. 该类型账号在小红书上的定位是否清晰，"我是谁、服务谁、独特价值"三要素是否完整
2. 佛法/禅修/道场弘法内容如何在小红书上保持"人设温度"——既保持法义庄严，又能被年轻人接受
3. 如何在众多心灵成长账号中建立差异化——深耕细分领域，形成内容壁垒`;

  const fallback = getRuleBasedDiagnosis({ accountType, contentType, targetAudience, postsPerWeek, goal, accountName });

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
        max_tokens: 1500,
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
  accountType: string; contentType: string; targetAudience: string; postsPerWeek: string; goal: string; accountName?: string;
}) {
  const { accountType, contentType, postsPerWeek } = params;

  let clarity = 60, warmth = 55, diff = 65;

  if (accountType === '法师/僧人') warmth = Math.min(100, warmth + 25);
  if (accountType === '禅修道场/寺院') { warmth = Math.min(100, warmth + 15); clarity = Math.min(100, clarity + 10); }
  if (accountType === '居士/义工') warmth = Math.min(100, warmth + 10);
  if (contentType === '金句图文') clarity = Math.min(100, clarity + 15);
  if (contentType === '讲座视频') { clarity = Math.min(100, clarity - 10); warmth = Math.min(100, warmth + 10); }
  if (contentType === '修行生活') { warmth = Math.min(100, warmth + 15); diff = Math.min(100, diff + 10); }
  if (postsPerWeek === '不足1篇') { clarity = Math.max(0, clarity - 20); diff = Math.max(0, diff - 15); }

  const overall = clarity < 60
    ? '账号定位需要进一步明确，建议先梳理清楚"我是谁、我服务谁、我的独特价值是什么"这三个问题。'
    : warmth < 60
    ? '内容有专业度，但在"人设温度"上需要加强，建议增加更多个人故事和真实感悟的表达。'
    : '账号整体定位清晰，可进一步优化差异化表达，在众多同类账号中建立独特记忆点。';

  const recommendedTags = accountType === '法师/僧人'
    ? ['#法师开示', '#佛法', '#禅修', '#修行', '#心灵成长']
    : accountType === '禅修道场/寺院'
    ? ['#禅修', '#道场', '#寺院生活', '#修行', '#佛法']
    : ['#佛法', '#心灵成长', '#正念', '#修行', '#自我觉察'];

  const quickWins = [
    '在简介写清楚"我帮助谁解决什么问题"',
    '固定每周2篇，形成稳定更新节奏',
    '每篇内容加1个个人真实故事',
  ];

  return {
    clarity,
    warmth,
    differentiation: diff,
    overall,
    clarityAdvice: [
      '明确账号的核心价值主张：您的账号为哪类人群解决什么问题？',
      '保持内容垂直度，避免内容过于分散导致标签模糊',
      '设计清晰的"人设故事线"，让用户快速理解账号定位',
    ],
    warmAdvice: [
      '在每篇内容中加入个人经历或真实感悟，让内容有温度',
      '法师/机构账号建议有固定出镜人，避免纯内容堆砌',
      '评论区互动要体现人格化，不要用过于官方的语言',
    ],
    diffAdvice: [
      '深耕一个细分领域（如"职场人的佛法修行"），避免泛泛而谈',
      '挖掘独特的弘法理念，形成差异化内容壁垒',
      '建立账号独特的视觉风格和语言风格，形成辨识度',
    ],
    quickWins,
    recommendedTags,
  };
}
