import { MetadataRoute } from 'next';

const BASE_URL = 'https://zenjing.vercel.app';

const TOOLS = [
  { path: '/tools/check', title: '净言 · 合规检测', desc: '实时检测小红书笔记中的违禁词，降低限流风险。专为佛学、心灵成长类创作者设计。' },
  { path: '/tools/translate', title: '转语 · 内容翻译', desc: '将法师讲座内容翻译成小红书用户能理解的语言，保留佛法精髓。AI 驱动，三种输出模式。' },
  { path: '/tools/title', title: '钩子 · 爆款标题生成', desc: '输入主题，生成15个备选标题。五种标题类型：悬疑式、痛点式、数字冲击、身份代入、情绪共鸣。' },
  { path: '/tools/tags', title: '灵签 · 标签推荐', desc: '输入笔记内容，智能推荐核心标签与长尾标签组合。内置佛教/心灵成长垂直标签库。' },
  { path: '/tools/poster', title: '墨境 · 金句图文', desc: '输入法师金句，一键生成小红书封面图。五种禅意模板：禅墨、素宣、净白、暖阳、暮钟。' },
  { path: '/tools/calendar', title: '时序 · 发布日历', desc: '规划发布节奏，把握最佳时间窗口。支持周视图、内容状态管理、本地数据持久化。' },
  { path: '/tools/diagnose', title: '观己 · 账号诊断', desc: 'AI 三维诊断报告：定位清晰度、人设温度、差异化指数。为佛学类账号提供优化建议。' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  const toolPages: MetadataRoute.Sitemap = TOOLS.map(tool => ({
    url: `${BASE_URL}${tool.path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: tool.path === '/tools/check' ? 0.8 : 0.7,
  }));

  return [...staticPages, ...toolPages];
}
