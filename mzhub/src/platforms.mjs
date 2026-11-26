// 平台登记表：颜色、登录页、采集权重。auto 平台回读一致后自动提交，manual 平台填完等人点
export const PLATFORMS = [
  {
    id: 'bilibili',
    name: 'B站',
    color: '#3FB6E8',
    login: 'https://member.bilibili.com/platform/upload/video/frame',
    weight: 3200,
    fans: 66412,
  },
  {
    id: 'douyin',
    name: '抖音',
    color: '#F2577A',
    login: 'https://creator.douyin.com/creator-micro/content/upload',
    weight: 5000,
    fans: 21870,
  },
  {
    id: 'xhs',
    name: '小红书',
    color: '#E8524A',
    login: 'https://creator.xiaohongshu.com/publish/publish?target=video',
    weight: 1500,
    fans: 9320,
  },
  {
    id: 'channels',
    name: '视频号',
    color: '#7FC97F',
    login: 'https://channels.weixin.qq.com/platform/post/create',
    weight: 700,
    fans: 4120,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#E8574C',
    login: 'https://studio.youtube.com/',
    weight: 900,
    fans: 2084,
  },
  {
    id: 'x',
    name: 'X',
    color: '#9AA0AA',
    login: 'https://x.com/home',
    weight: 260,
    fans: 1462,
  },
  {
    id: 'threads',
    name: 'Threads',
    color: '#B9B2A6',
    login: 'https://www.threads.com/',
    weight: 180,
    fans: 226,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#C77DBB',
    login: 'https://www.instagram.com/',
    weight: 210,
    fans: 948,
  },
]

export const BY_ID = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]))
export const platformName = (id) => BY_ID[id]?.name || id
