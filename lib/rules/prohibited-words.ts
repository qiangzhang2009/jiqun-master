export type ProhibitedWord = {
  word: string;
  type: 'prohibited' | 'warning';
  replacement?: string;
  note?: string;
};

export type Category = {
  name: string;
  icon: string;
  words: ProhibitedWord[];
};

export const categories: Category[] = [
  {
    name: '绝对化表述',
    icon: '⚡',
    words: [
      { word: '最', type: 'warning', replacement: '很', note: '组合词时才触发' },
      { word: '第一', type: 'prohibited', replacement: '领先', note: '' },
      { word: '绝对', type: 'prohibited', replacement: '完全', note: '' },
      { word: '100%', type: 'prohibited', replacement: '很可能', note: '' },
      { word: '保证', type: 'prohibited', replacement: '帮助', note: '' },
      { word: '彻底', type: 'warning', replacement: '全面', note: '' },
      { word: '完美', type: 'warning', replacement: '很好', note: '' },
      { word: '一定', type: 'warning', replacement: '往往会', note: '' },
    ],
  },
  {
    name: '封建迷信相关',
    icon: '🕯',
    words: [
      { word: '保佑', type: 'prohibited', replacement: '祝福', note: '可用"祝福"替代' },
      { word: '因果报应', type: 'prohibited', replacement: '因果规律', note: '慎用因果概念' },
      { word: '轮回', type: 'warning', replacement: '生命循环', note: '需中性表述' },
      { word: '业力', type: 'warning', replacement: '行为习惯', note: '可用"习气"替代' },
      { word: '加持', type: 'warning', replacement: '帮助', note: '可用"护佑"替代' },
      { word: '消灾', type: 'prohibited', replacement: '化解', note: '' },
      { word: '超度', type: 'warning', replacement: '关怀', note: '' },
      { word: '菩萨保佑', type: 'prohibited', replacement: '心存善念', note: '' },
      { word: '佛祖显灵', type: 'prohibited', replacement: '有所感悟', note: '' },
      { word: '做法', type: 'warning', replacement: '方法', note: '歧义语境' },
      { word: '算命', type: 'prohibited', replacement: '了解自己', note: '' },
      { word: '看相', type: 'prohibited', replacement: '观察', note: '' },
      { word: '风水', type: 'warning', replacement: '环境', note: '' },
      { word: '驱邪', type: 'prohibited', replacement: '净化', note: '' },
      { word: '开光', type: 'warning', replacement: '祝福', note: '' },
    ],
  },
  {
    name: '医疗/健康暗示',
    icon: '💊',
    words: [
      { word: '治疗', type: 'prohibited', replacement: '缓解', note: '' },
      { word: '治愈', type: 'prohibited', replacement: '帮助改善', note: '' },
      { word: '根治', type: 'prohibited', replacement: '有助于', note: '' },
      { word: '特效', type: 'prohibited', replacement: '有效', note: '' },
      { word: '药到病除', type: 'prohibited', replacement: '有所改善', note: '' },
      { word: '消炎', type: 'prohibited', replacement: '缓解', note: '' },
      { word: '退烧', type: 'prohibited', replacement: '降温', note: '' },
      { word: '医术', type: 'warning', replacement: '方法', note: '' },
      { word: '诊', type: 'warning', note: '单字"诊"可能触发', replacement: '判断' },
      { word: '病', type: 'warning', note: '"生理疾病"语境慎用', replacement: '不适' },
      { word: '医院', type: 'warning', note: '医疗语境', replacement: '机构' },
    ],
  },
  {
    name: '虚假/夸大宣传',
    icon: '🚫',
    words: [
      { word: '奇迹', type: 'warning', replacement: '明显变化', note: '' },
      { word: '神了', type: 'prohibited', replacement: '确实有效', note: '' },
      { word: '立刻', type: 'warning', replacement: '逐渐', note: '' },
      { word: '马上', type: 'warning', replacement: '不久后', note: '' },
      { word: '几天见效', type: 'prohibited', replacement: '长期坚持会有帮助', note: '' },
      { word: '快速', type: 'warning', replacement: '持续', note: '' },
    ],
  },
  {
    name: '平台引流敏感词',
    icon: '📢',
    words: [
      { word: '加微信', type: 'prohibited', replacement: '私信联系', note: '' },
      { word: '加V', type: 'prohibited', replacement: '私信', note: '' },
      { word: '私聊', type: 'warning', replacement: '私信', note: '' },
      { word: '扣扣', type: 'prohibited', replacement: '', note: '' },
      { word: '公众号', type: 'warning', replacement: '平台账号', note: '' },
      { word: '小红书群', type: 'warning', replacement: '评论区见', note: '' },
      { word: '扫码', type: 'warning', replacement: '', note: '' },
    ],
  },
  {
    name: '违禁/高风险',
    icon: '⚠',
    words: [
      { word: '赚钱', type: 'warning', replacement: '收获', note: '营销语境' },
      { word: '副业', type: 'warning', replacement: '技能', note: '' },
      { word: '兼职', type: 'warning', replacement: '学习', note: '' },
      { word: '躺赚', type: 'prohibited', replacement: '收获', note: '' },
      { word: '快速赚钱', type: 'prohibited', replacement: '', note: '' },
      { word: '暴富', type: 'prohibited', replacement: '', note: '' },
    ],
  },
  {
    name: 'AI生成内容标注',
    icon: '🤖',
    words: [
      { word: 'AI生成', type: 'warning', note: '2026年起平台要求标注AI内容', replacement: '' },
      { word: 'ChatGPT', type: 'warning', note: '如为AI辅助创作应注明', replacement: '' },
      { word: '人工智能', type: 'warning', note: '营销语境慎用', replacement: '' },
    ],
  },
];

export function checkProhibitedWords(text: string): Array<{
  word: string;
  category: string;
  type: 'prohibited' | 'warning';
  replacement?: string;
  note?: string;
  position: number;
}> {
  const results: Array<{
    word: string;
    category: string;
    type: 'prohibited' | 'warning';
    replacement?: string;
    note?: string;
    position: number;
  }> = [];
  const lower = text.toLowerCase();

  for (const category of categories) {
    for (const item of category.words) {
      if (!item.word) continue;
      const word = item.word.toLowerCase();
      let pos = lower.indexOf(word);
      while (pos !== -1) {
        // Avoid overlapping matches
        const overlaps = results.some(r => pos < r.position + r.word.length && pos + word.length > r.position);
        if (!overlaps) {
          results.push({
            word: text.slice(pos, pos + word.length),
            category: category.name,
            type: item.type,
            replacement: item.replacement,
            note: item.note,
            position: pos,
          });
        }
        pos = lower.indexOf(word, pos + 1);
      }
    }
  }

  return results.sort((a, b) => a.position - b.position);
}
