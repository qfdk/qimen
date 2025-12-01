# 奇门遁甲排盘系统

基于 Node.js 的奇门遁甲排盘系统，遵循茅山派奇门遁甲排盘方法，支持转盘排法。

## 功能特点

- **实时排盘** - 根据当前时间自动计算奇门盘
- **自选时间** - 支持任意日期时间排盘
- **完整要素** - 包含地盘、天盘、八门、九星、八神、暗干等
- **直观界面** - 九宫格可视化展示，信息清晰明了
- **转盘排法** - 采用传统转盘方式排布天盘与八门

## 预览

访问在线演示：[qm.qfdk.me](https://qm.qfdk.me)

## 快速开始

### 安装

```bash
git clone https://github.com/qfdk/qimen.git
cd qimen
pnpm install
```

### 运行

```bash
pnpm start
```

浏览器访问 `http://localhost:3000`

## Docker 部署

```bash
# 构建镜像
docker build -t qimen .

# 运行容器
docker run -p 3000:3000 qimen
```

## 技术栈

| 类型 | 技术 |
|------|------|
| 后端 | Node.js + Express |
| 模板 | EJS |
| 前端 | HTML + CSS + JavaScript + Bootstrap |
| 历法 | lunar-javascript |

## 项目结构

```
qimen/
├── app.js              # 应用入口
├── lib/                # 核心算法
│   ├── qimen.js        # 奇门排盘主逻辑
│   ├── bamen.js        # 八门计算
│   ├── bashen.js       # 八神计算
│   ├── jiuxing.js      # 九星计算
│   ├── dipan.js        # 地盘计算
│   └── constants.js    # 常量定义
├── views/              # 页面模板
├── public/             # 静态资源
│   ├── css/
│   └── js/
└── Dockerfile
```

## 奇门基础

### 阴阳遁局数

**阳遁歌诀：**
```
冬至、惊蛰一七四，小寒二八五，
大寒、春分三九六，雨水九六三，
清明、立夏四一七，立春八五二，
谷雨、小满五二八，芒种六三九。
```

**阴遁歌诀：**
```
夏至、白露九三六，小暑八二五，
大暑、秋分七一四，立秋二五八，
寒露、立冬六九三，处暑一四七，
霜降、小雪五八二，大雪四七一。
```

### 排盘步骤

1. 确定节气与三元（上元/中元/下元）
2. 确定阴阳遁与局数
3. 排布地盘天干地支
4. 确定值符、值使
5. 排布天盘九星
6. 排布八门
7. 排布八神

## 许可证

MIT License
