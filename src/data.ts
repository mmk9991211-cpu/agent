export type Column = 'waiting' | 'review' | 'running'

export interface SessionCard {
  id: string
  title: string
  brief: string
  account: string
  platform: string
  column: Column
  updated: string
  ask?: string
  messages: { role: 'user' | 'ai'; text: string; steps?: string[] }[]
}

export interface ScheduleEvent {
  id: string
  day: number
  title: string
  platform: string
  status: 'draft' | 'scheduled' | 'published' | 'overdue'
  time?: string
}

export interface HotItem {
  id: string
  title: string
  score: number
  growth: number
  platforms: { name: string; rank: number }[]
  tags: string[]
  angle: string
}

export interface BoardItem {
  rank: number
  title: string
  heat: string
}

export interface Draft {
  id: string
  title: string
  platform: string
  status: '初稿' | '待审' | '已定稿'
  words: number
  updated: string
  folder: string
  body: string
}

export interface MediaItem {
  id: string
  name: string
  type: '图片' | '视频' | '文案' | '配乐'
  meta: string
  tag: string
  from: 'AI 生成' | '爆款拆解' | '本地上传' | '订阅同步'
  ratio: '3:4' | '9:16' | '16:9' | '1:1'
}

export interface KnowledgeItem {
  id: string
  title: string
  platform: string
  author: string
  status: '已转写' | '待转写' | '已拆解' | '同步中'
  savedAt: string
  comments: number
}

export const accounts = [
  { name: 'MZ 主号', platform: '小红书', fans: '3.2w', tone: '专业但不端着' },
  { name: 'MZ 副号', platform: '抖音', fans: '1.8w', tone: '口语、有梗' },
  { name: '出海号', platform: 'Instagram', fans: '0.7w', tone: '简洁英文' },
]

export const sessions: SessionCard[] = [
  {
    id: 's1',
    title: '秋季新品 · 小红书图文笔记',
    brief: '按知识库里的调研资料写 3 篇笔记，配 3:4 封面',
    account: 'MZ 主号',
    platform: '小红书',
    column: 'waiting',
    updated: '3 分钟前',
    ask: '这 3 篇的落点你想偏「成分科普」还是「使用场景」？',
    messages: [
      { role: 'user', text: '用知识库里的秋季新品调研，写 3 篇小红书笔记，风格延续主号。' },
      {
        role: 'ai',
        text: '我读了 4 条调研笔记和主号最近 12 篇已发内容，提炼出三个可用切口：成分、场景、对比测评。',
        steps: ['检索知识库 · 4 条命中', '读取账号档案 · 主号文风', '参考近 12 篇已发布结构'],
      },
      { role: 'ai', text: '三个切口都能写，但主号最近成分类偏多，是否需要换一下配比？' },
    ],
  },
  {
    id: 's2',
    title: '抖音口播：3 个护肤误区',
    brief: '45 秒口播脚本 + 分镜，输出 9:16 素材包',
    account: 'MZ 副号',
    platform: '抖音',
    column: 'waiting',
    updated: '21 分钟前',
    ask: '开头用「反问」还是「直接打脸」？我先按反问写了。',
    messages: [
      { role: 'user', text: '写个 45 秒口播，讲三个最常见的护肤误区。' },
      { role: 'ai', text: '已出脚本初版，含口播、分镜和字幕断句。开头两种写法都列了。', steps: ['检索爆款结构 · 8 条', '生成脚本 · 486 字'] },
    ],
  },
  {
    id: 's3',
    title: '公众号长文 · 秋季护肤全攻略',
    brief: '3200 字长文 + 头图 + 3 张插图',
    account: 'MZ 主号',
    platform: '公众号',
    column: 'review',
    updated: '1 小时前',
    messages: [
      { role: 'user', text: '把这周的素材整理成一篇公众号长文。' },
      {
        role: 'ai',
        text: '长文已完成，3200 字，8 个小标题。配了头图和 3 张插图，素材包已打包。',
        steps: ['汇总素材 · 11 条', '生成大纲 · 8 节', '撰写正文', '生成配图 · 4 张', '打包素材包'],
      },
    ],
  },
  {
    id: 's4',
    title: '封面 A/B 测试 · 6 版',
    brief: '同一标题出 6 版封面，按点击率排优先级',
    account: 'MZ 主号',
    platform: '小红书',
    column: 'review',
    updated: '2 小时前',
    messages: [
      { role: 'user', text: '给「秋季护肤别再踩这 3 个坑」出 6 版封面。' },
      { role: 'ai', text: '6 版封面已生成，含 2 版大字报、2 版对比图、2 版真人感。', steps: ['套用模板 · 大字报', '生成图片 · 6 张'] },
    ],
  },
  {
    id: 's5',
    title: '爆款拆解 · 竞品 12 篇',
    brief: '批量拆解结构、钩子和评论区高频问题',
    account: 'MZ 主号',
    platform: '多平台',
    column: 'running',
    updated: '正在运行 · 62%',
    messages: [
      { role: 'user', text: '把订阅的这 3 个对标号最近 12 篇都拆一遍。' },
      { role: 'ai', text: '已完成 8/12，正在拆第 9 篇。', steps: ['转写视频 · 5 条', '拆解结构 · 8 篇', '评论聚类 · 进行中'] },
    ],
  },
  {
    id: 's6',
    title: '内容日历 · 12 月排期',
    brief: '按双十二节点排 18 条内容',
    account: '全部账号',
    platform: '排期',
    column: 'running',
    updated: '正在运行 · 34%',
    messages: [
      { role: 'user', text: '按双十二节奏排一下 12 月的内容日历。' },
      { role: 'ai', text: '正在结合历史发布节奏和节日节点计算，已排 6 条。', steps: ['读取历史发布 · 90 天', '节日节点对齐'] },
    ],
  },
]

export const scheduleEvents: ScheduleEvent[] = [
  { id: 'e1', day: 3, title: '秋季新品开箱', platform: '小红书', status: 'published', time: '10:00' },
  { id: 'e2', day: 5, title: '成分科普 · 烟酰胺', platform: '小红书', status: 'published', time: '20:00' },
  { id: 'e3', day: 8, title: '双十一预热口播', platform: '抖音', status: 'published', time: '18:30' },
  { id: 'e4', day: 12, title: '换季护肤清单', platform: '公众号', status: 'published', time: '09:00' },
  { id: 'e5', day: 15, title: '评论区答疑合集', platform: '小红书', status: 'published', time: '12:00' },
  { id: 'e6', day: 19, title: '护肤误区口播', platform: '抖音', status: 'overdue', time: '19:00' },
  { id: 'e7', day: 22, title: '秋季新品复购向', platform: '小红书', status: 'published', time: '11:00' },
  { id: 'e8', day: 24, title: '达人合作 · 联合笔记', platform: '小红书', status: 'overdue', time: '15:00' },
  { id: 'e9', day: 26, title: '秋季新品 3 篇笔记', platform: '小红书', status: 'draft', time: '20:00' },
  { id: 'e10', day: 27, title: '公众号长文全攻略', platform: '公众号', status: 'scheduled', time: '09:00' },
  { id: 'e11', day: 28, title: '黑五出海帖 · 英文', platform: 'Instagram', status: 'scheduled', time: '22:00' },
  { id: 'e12', day: 30, title: '11 月复盘 + 12 月预告', platform: '小红书', status: 'draft', time: '20:00' },
]

export const hotItems: HotItem[] = [
  {
    id: 'h1',
    title: '换季烂脸自救指南',
    score: 96,
    growth: 218,
    platforms: [
      { name: '小红书', rank: 3 },
      { name: '抖音', rank: 7 },
      { name: '微博', rank: 12 },
    ],
    tags: ['护肤', '换季', '强需求'],
    angle: '主号文风适配度高，可做「先避坑再补救」结构，配对比图封面',
  },
  {
    id: 'h2',
    title: '成分党开始反水了',
    score: 91,
    growth: 164,
    platforms: [
      { name: '小红书', rank: 6 },
      { name: '知乎', rank: 2 },
    ],
    tags: ['成分', '争议', '高互动'],
    angle: '争议题容易起量，适合副号口播，注意立场客观',
  },
  {
    id: 'h3',
    title: '早 C 晚 A 到底还要不要',
    score: 87,
    growth: 92,
    platforms: [
      { name: '小红书', rank: 11 },
      { name: 'B 站', rank: 9 },
      { name: '抖音', rank: 18 },
    ],
    tags: ['经典题', '长尾', '可复用'],
    angle: '老题新写，用最新研究数据切入，适合公众号长文',
  },
  {
    id: 'h4',
    title: '双十二美妆价格战',
    score: 84,
    growth: 76,
    platforms: [
      { name: '微博', rank: 4 },
      { name: '抖音', rank: 11 },
    ],
    tags: ['大促', '商业', '时效'],
    angle: '时效强，需 48 小时内出稿，可做价格对比表封面',
  },
  {
    id: 'h5',
    title: '北方干冷 vs 南方湿冷护肤',
    score: 79,
    growth: 58,
    platforms: [
      { name: '小红书', rank: 17 },
      { name: '知乎', rank: 14 },
    ],
    tags: ['地域', '细分', '低竞争'],
    angle: '细分需求精准，适合做系列选题的第 2 篇',
  },
  {
    id: 'h6',
    title: '护肤品空瓶记翻车',
    score: 74,
    growth: 41,
    platforms: [
      { name: '小红书', rank: 22 },
      { name: 'B 站', rank: 16 },
    ],
    tags: ['真人感', '信任', 'UGC'],
    angle: '真实性内容吃香，可用副号做视频版',
  },
]

export const boards: Record<string, BoardItem[]> = {
  小红书: [
    { rank: 1, title: '换季烂脸自救指南', heat: '986w' },
    { rank: 2, title: '秋冬身体乳红黑榜', heat: '742w' },
    { rank: 3, title: '成分党开始反水了', heat: '689w' },
    { rank: 4, title: '宿舍护肤极简版', heat: '512w' },
    { rank: 5, title: '25 岁该开始抗老了吗', heat: '467w' },
    { rank: 6, title: '平价替代真的靠谱吗', heat: '398w' },
  ],
  抖音: [
    { rank: 1, title: '3 秒看懂成分表', heat: '1.2亿' },
    { rank: 2, title: '换季护肤别再做错', heat: '8930w' },
    { rank: 3, title: '双十二提前购攻略', heat: '7210w' },
    { rank: 4, title: '皮肤科医生怎么说', heat: '5640w' },
    { rank: 5, title: '一瓶用到底的懒人法', heat: '4820w' },
    { rank: 6, title: '100 块搞定全套', heat: '3960w' },
  ],
  微博: [
    { rank: 1, title: '双十二美妆价格战', heat: '2.1亿' },
    { rank: 2, title: '秋冬干燥预警', heat: '8740w' },
    { rank: 3, title: '国货护肤崛起', heat: '6120w' },
    { rank: 4, title: '成分表看不懂怎么办', heat: '4310w' },
    { rank: 5, title: '护肤博主翻车', heat: '3980w' },
  ],
  知乎: [
    { rank: 1, title: '成分党开始反水了', heat: '4821 万热度' },
    { rank: 2, title: '早 C 晚 A 有科学依据吗', heat: '3210 万热度' },
    { rank: 3, title: '如何评价国货护肤品', heat: '2740 万热度' },
    { rank: 4, title: '北方干冷如何护肤', heat: '1980 万热度' },
    { rank: 5, title: '护肤品的智商税', heat: '1620 万热度' },
  ],
  B站: [
    { rank: 1, title: '我把 20 款面霜送检了', heat: '421w 播放' },
    { rank: 2, title: '成分党开始反水了', heat: '318w 播放' },
    { rank: 3, title: '早 C 晚 A 三年实测', heat: '276w 播放' },
    { rank: 4, title: '空瓶记翻车合集', heat: '192w 播放' },
    { rank: 5, title: '护肤科研人聊配方', heat: '158w 播放' },
  ],
}

export const drafts: Draft[] = [
  {
    id: 'd1',
    title: '秋季新品 3 篇笔记 · 成分科普版',
    platform: '小红书',
    status: '初稿',
    words: 1180,
    updated: '3 分钟前',
    folder: '11 月 · 秋季新品',
    body: `# 换季烂脸？先别急着换全套

上周后台收到 47 条同样的问题：换季了，脸开始泛红、起皮、上妆卡粉，是不是要把护肤品全套换掉？

**先说结论：不要。**

换季皮肤屏障本来就处在波动期，这时候大换血，等于给已经紧绷的皮肤再加一层压力。

## 一、先判断你是哪种「烂」

- **缺水性起皮**：洗完脸 3 分钟内紧绷，摸起来粗糙。这类只要加一步保湿精华就能缓解。
- **屏障受损泛红**：遇热、遇风刺痛，用以前的护肤品开始刺。这类要停掉酸类和 A 醇，做减法。
- **过敏反应**：局部红肿、痒、有丘疹。这类别自己折腾，直接就医。

三种处理方式完全不同，混着来只会越来越糟。

## 二、换季只做三件事

1. **减**：停掉所有功效叠加，只留清洁 + 保湿 + 防晒。
2. **补**：神经酰胺、角鲨烷、泛醇，这三个成分选一个就够。
3. **等**：给皮肤 14 天，别每天照镜子焦虑。

## 三、什么情况才算「该换」

用满两周仍然刺痛、泛红不退，再考虑换。换的时候一次只换一个产品，方便定位问题。

---

需要我把这三篇的封面也一起出吗？封面我建议做「前后对比」+「大字报」两版对照测。`,
  },
  {
    id: 'd2',
    title: '公众号长文 · 秋季护肤全攻略',
    platform: '公众号',
    status: '待审',
    words: 3216,
    updated: '1 小时前',
    folder: '11 月 · 长文',
    body: `# 秋天护肤，别再重复这 8 个错误

每年入秋，护肤问题的搜索量会涨 2.3 倍。但真正需要「换产品」的人，不到三成。

## 01 · 一入秋就整套换新

皮肤对产品的适应需要时间，整套换新意味着同时引入 5 到 8 个新变量，一旦出问题，你根本不知道是谁的问题。

## 02 · 把「刺痛」当成「在起作用」

刺痛是屏障在报警，不是有效成分在起效。真正起效的成分，感受通常是温和的。

## 03 · 秋冬就不用防晒

UVA 全年稳定，穿透玻璃。秋季的干燥 + 紫外线，是色斑最舒服的组合。

## 04 · 用更热的水洗脸

水温每升高 5 度，皮脂流失速度明显加快。37 度左右足够。

## 05 · 面霜越厚越好

厚重感不等于保湿力。关键在封闭剂和保湿剂的配比，油皮用厚面霜只会闷。

## 06 · 忽略身体和唇部

秋冬最容易被忽略的两块皮肤，也是最容易暴露年龄的两块。

## 07 · 频繁去角质「抛光」

屏障受损期去角质，等于在伤口上打磨。

## 08 · 只看成分表不看浓度和配方

1% 的烟酰胺和 10% 的烟酰胺是两件事，配方体系决定了它能不能被吸收。

---

**写在最后**：护肤的确定性，来自「少变动、多观察」。`,
  },
  {
    id: 'd3',
    title: '抖音口播 · 三个护肤误区',
    platform: '抖音',
    status: '已定稿',
    words: 486,
    updated: '21 分钟前',
    folder: '11 月 · 短视频',
    body: `# 三个护肤误区（45 秒口播）

**开头 A（反问）**
"你每天认真护肤，为什么脸越来越差？"

**开头 B（打脸）**
"这三个动作，正在毁掉你的脸。"

## 正文

**误区一：洗面奶要洗到「涩」才算干净**
你以为的干净，是把皮脂膜一起洗掉了。洗完紧绷，不是干净，是屏障在报警。

**误区二：精华叠得越多越好**
叠三层精华，皮肤只吸收得了一层。剩下的在脸上氧化，还容易搓泥。

**误区三：敷面膜敷到干**
面膜纸干了会反向吸走角质层水分。15 分钟，到点就揭。

## 收尾

护肤不是做加法，是做减法。
关注我，少踩坑。

---
**分镜**：0-3s 特写脸部 / 3-15s 误区一 手持产品 / 15-30s 误区二三 快切 / 30-45s 正脸收尾`,
  },
  {
    id: 'd4',
    title: '黑五出海帖（英文）',
    platform: 'Instagram',
    status: '初稿',
    words: 320,
    updated: '4 小时前',
    folder: '11 月 · 出海',
    body: `# Black Friday: the only 3 products worth it

We tested 41 skincare products this year. Only three earned a repurchase.

**1. Barrier repair cream**
Fragrance-free, ceramide-forward, works on compromised skin in 7 days.

**2. Gentle gel cleanser**
pH 5.5. Doesn't strip. The one we keep buying.

**3. Daily SPF 50**
No white cast, no pilling under makeup. Non-negotiable.

Everything else? Wait for the spring sale.

---
**Caption**: Save this before Black Friday. You don't need 20 products, you need 3.
**Hashtags**: #skincare #blackfriday #skinbarrier #glowup`,
  },
  {
    id: 'd5',
    title: '11 月复盘 + 12 月预告',
    platform: '小红书',
    status: '初稿',
    words: 640,
    updated: '昨天',
    folder: '11 月 · 复盘',
    body: `# 11 月复盘：数据最好的那篇，我差点没发

这个月发了 18 篇，最高一篇 4.2 万赞，最低一篇 300 赞。差了 140 倍。

## 数据最好的三篇，共同点是什么

1. **开头第一句就在解决具体问题**，没有铺垫。
2. **封面只有一个信息点**，字大、对比强。
3. **评论区有争议空间**，但不是引战。

## 数据最差的三篇，问题出在哪

- 选题太"正确"，没有具体场景
- 封面塞了 3 个信息点，等于没有信息点
- 正文前半段在自我介绍

## 12 月要试的三件事

1. 把"科普"改成"答疑"，用真实提问开头
2. 封面统一走大字报 + 强对比，做 A/B
3. 每周固定一篇"翻车/踩坑"，做信任

---
12 月排期已经排好 18 条，双十二节点占 6 条。`,
  },
]

export const mediaItems: MediaItem[] = [
  { id: 'm1', name: '换季对比图 · 大字报 A', type: '图片', meta: '1240 × 1653', tag: '封面', from: 'AI 生成', ratio: '3:4' },
  { id: 'm2', name: '换季对比图 · 大字报 B', type: '图片', meta: '1240 × 1653', tag: '封面', from: 'AI 生成', ratio: '3:4' },
  { id: 'm3', name: '成分表特写 · 产品图', type: '图片', meta: '2048 × 2048', tag: '配图', from: '本地上传', ratio: '1:1' },
  { id: 'm4', name: '口播 · 三误区成片 v3', type: '视频', meta: '00:45 · 1080p', tag: '短视频', from: 'AI 生成', ratio: '9:16' },
  { id: 'm5', name: '公众号头图 · 秋日暖调', type: '图片', meta: '900 × 383', tag: '头图', from: 'AI 生成', ratio: '16:9' },
  { id: 'm6', name: '竞品 12 篇拆解 · 结构与钩子', type: '文案', meta: '4820 字', tag: '拆解', from: '爆款拆解', ratio: '1:1' },
  { id: 'm7', name: '空瓶记 · 实拍 4 张', type: '图片', meta: '3024 × 4032', tag: '配图', from: '本地上传', ratio: '3:4' },
  { id: 'm8', name: '轻电子 · 背景配乐 02', type: '配乐', meta: '01:20 · 48kHz', tag: '配乐', from: '订阅同步', ratio: '1:1' },
  { id: 'm9', name: '护肤误区 · 封面 6 版', type: '图片', meta: '6 张 · 打包', tag: '封面', from: 'AI 生成', ratio: '3:4' },
  { id: 'm10', name: '黑五出海帖 · 配图', type: '图片', meta: '1080 × 1350', tag: '配图', from: 'AI 生成', ratio: '3:4' },
  { id: 'm11', name: '评论区高频问题聚类', type: '文案', meta: '1260 字', tag: '选题', from: '爆款拆解', ratio: '1:1' },
  { id: 'm12', name: '开箱视频 · 素材原片', type: '视频', meta: '03:12 · 4K', tag: '原片', from: '本地上传', ratio: '16:9' },
]

export const knowledgeItems: KnowledgeItem[] = [
  { id: 'k1', title: '换季烂脸自救：皮肤科医生的 5 条建议', platform: '小红书', author: '皮皮医生', status: '已拆解', savedAt: '今天 09:12', comments: 328 },
  { id: 'k2', title: '我测了 41 款护肤品，只回购这 3 个', platform: 'B站', author: '实验室老张', status: '已转写', savedAt: '今天 08:40', comments: 1204 },
  { id: 'k3', title: 'Why your skin barrier breaks in autumn', platform: 'YouTube', author: 'Dr. Lim', status: '已转写', savedAt: '昨天 22:05', comments: 86 },
  { id: 'k4', title: '双十二美妆价格战全记录', platform: '微博', author: '美妆观察', status: '待转写', savedAt: '昨天 19:31', comments: 452 },
  { id: 'k5', title: '成分党为什么开始反水', platform: '知乎', author: '配方师阿May', status: '已拆解', savedAt: '昨天 16:20', comments: 913 },
  { id: 'k6', title: '秋冬身体乳红黑榜（12 款实测）', platform: '小红书', author: '干皮自救', status: '同步中', savedAt: '昨天 11:02', comments: 267 },
]

export const tools = [
  { id: 't1', name: '封面工作室', desc: '模板 + 生图', accent: 'amber' },
  { id: 't2', name: '图片生成', desc: '多家模型', accent: 'sky' },
  { id: 't3', name: '智能剪口播', desc: '自动去废话', accent: 'mint' },
  { id: 't4', name: '素材包打包', desc: '一稿多平台', accent: 'amber' },
  { id: 't5', name: '热点雷达', desc: '按账号打分', accent: 'rose' },
  { id: 't6', name: '爆款拆解', desc: '结构 / 钩子', accent: 'sky' },
]

export const stats = [
  { label: '等你处理', value: '2', unit: '项', delta: 'AI 已停下等你拍板', trend: [3, 2, 4, 2, 5, 2, 2] },
  { label: '待查看', value: '2', unit: '项', delta: '今日新增 2 个结果', trend: [1, 1, 2, 1, 3, 2, 2] },
  { label: '本周排期', value: '4', unit: '条', delta: '2 条已逾期', trend: [6, 5, 5, 4, 4, 4, 4] },
  { label: '素材总量', value: '312', unit: '个', delta: '本周 +18', trend: [240, 258, 271, 280, 296, 305, 312] },
]

export const dailyBrief = {
  date: '11 月 26 日 · 周四',
  headline: '今天值得跟进的 2 件事',
  items: [
    { text: '「换季烂脸自救」在 3 个平台同时上榜，主号适配度 96 分', action: '去创作' },
    { text: '订阅的「干皮自救」昨天更新 2 篇，评论区出现新的高频问题', action: '看拆解' },
  ],
  plan: ['20:00 发秋季新品第 1 篇（初稿已完成）', '补发 11-19 逾期的护肤误区口播', '12 月排期确认，还差 6 条'],
}
