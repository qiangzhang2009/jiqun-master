import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export async function POST(req: NextRequest) {
  const { title, content, views, likes, collects, comments } = await req.json();

  if (!title?.trim() && !content?.trim()) {
    return NextResponse.json({ error: '标题和正文不能同时为空' }, { status: 400 });
  }

  const systemPrompt = `你是一个专业的小红书内容运营分析师，特别擅长分析佛法、禅修、心灵成长类账号的笔记表现，给出数据驱动的改进建议。

输出格式为JSON，必须包含以下字段：
{
  "summary": "字符串，综合评价（2~3句话，要具体指出这篇笔记的亮点和不足）",
  "dataAnalysis": {
    "engagement": "数字(0-100)，互动率评估（点赞+收藏+评论/阅读量）",
    "contentQuality": "数字(0-100)，内容质量评估",
    "titleQuality": "数字(0-100)，标题质量评估"
  },
  "strengths": "字符串数组，3~5条这篇笔记做得好的地方",
  "weaknesses": "字符串数组，2~4条这篇笔记的不足之处",
  "nextPostSuggestions": "字符串数组，3~5条具体可操作的下一篇文章改进建议",
  "bestPostingTime": "字符串，建议的最佳发布时间（具体到时段，如"周二20:00~21:00"）",
  "contentDirection": "字符串，1~2句话指出下一个最适合做的内容方向"
}

评分说明：
- 互动率：0~5%优秀，5~10%良好，10%以上非常优秀，0~1%较差
- 内容质量：看结构、深度、情感共鸣
- 标题质量：看钩子、好奇心、数字冲击

建议要非常具体，不能泛泛而谈，如"多发内容"这类废话不要出现。`;

  const userPrompt = `请分析以下这篇小红书笔记的数据表现：

标题：${title || '(未提供)'}
正文：${content || '(未提供)'}
数据：
- 阅读量：${views || 0}
- 点赞数：${likes || 0}
- 收藏数：${collects || 0}
- 评论数：${comments || 0}
${(views || likes || collects || comments) ? `- 互动率：${views ? (((Number(likes) + Number(collects) + Number(comments)) / Number(views)) * 100).toFixed(2) : 0}%` : ''}`;

  const fallback = {
    summary: '数据不足，无法进行深度分析。请补充阅读量和互动数据以获得更准确的诊断。',
    dataAnalysis: {
      engagement: '?',
      contentQuality: '?',
      titleQuality: '?',
    },
    strengths: ['内容有禅修/佛法核心观点', '原文有一定深度'],
    weaknesses: ['缺少数据反馈，无法评估', '建议在发布后记录互动数据'],
    nextPostSuggestions: ['参考这篇内容方向继续深耕', '优化标题，增强钩子', '增加个人经历分享'],
    bestPostingTime: '周二~周四 20:00~21:00',
    contentDirection: '继续围绕禅修实践和内心成长方向创作',
  };

  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json({ result: fallback });
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

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
      const result = JSON.parse(content);
      return NextResponse.json({ result });
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json({ result: JSON.parse(match[0]) });
      throw new Error('无法解析AI返回结果');
    }
  } catch (err) {
    console.error('Review API error:', err);
    return NextResponse.json({ result: fallback });
  }
}
