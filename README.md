# HillMoon 山月 · 品牌独立站

新中式首饰品牌 HillMoon（山月）的官网。纯静态站点，无构建步骤，无依赖。

## 结构

- `index.html` — 首页（品牌主视觉 / 精选系列 / 材质之道 / 品牌故事 / 联络）
- `products.html` — 全部商品，支持按类别（手链 / 项链 / 耳饰）与材质（珍珠 / 水晶 / 陶瓷 / 镀银 / 钢钛）筛选
- `about.html` — 品牌故事
- `js/products.js` — 商品数据（增删商品改这里即可，插画自动生成）
- `assets/` — logo 与徽记（由品牌 logo 原图经 AI 超分处理）

## 本地预览

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 部署

推送到 GitHub 后由 Vercel 自动部署，静态托管，无需构建命令。

## 待替换内容

- `js/products.js` 中的商品为占位数据（名称 / 价格 / SVG 插画），有实拍图后替换为 `<img>`
- 页脚联络方式为占位（小红书账号、邮箱 `hello@hillmoon.example`），上线前改为真实信息
