# HillMoon 山月 · 品牌独立站

新中式首饰品牌 HillMoon（山月）官网。三语（越南语为主 / 英语 / 中文），带商品管理后台。

## 结构

- `index.html` / `products.html` / `about.html` — 前台三页，默认越南语，右上角可切 EN / 中
- `admin.html` — 后台（`/admin`），账号密码登录
- `js/i18n.js` — 三语文案字典；`js/products.js` — 商品渲染；`js/admin.js` — 后台逻辑
- `api/` — Vercel Serverless Functions：
  - `login.js` — 登录 / 登出 / 会话检查（HMAC 签名 cookie，7 天有效）
  - `products.js` — GET 公开读取商品；PUT 保存（需登录）
  - `upload.js` — 图片上传到 Vercel Blob（需登录，前端已压缩到 1200px JPEG）
  - `_seed.js` — 初始占位商品（Blob 里还没有数据时使用）

## 数据与图片

商品数据和图片都存在 Vercel Blob（store: `hillmoon-store`）。数据每次保存写入新的
`data/catalog-<时间戳>.json`（避开覆盖写的 CDN 缓存延迟），读取时取最新版，自动清理只留 3 份。

## 后台使用

1. 打开 `/admin`，用账号密码登录
2. 可以：新增/删除商品、改三语名称、类别、材质、价格（₫）、库存、标签（新品/主打）、
   首页精选、单品上下架；点缩略图上传实拍图（没图时显示线描插画）
3. 顶部「上架类别」勾选决定前台显示哪些类别（如只勾手链，前台只出现手链）
4. 改完点「保存全部」，前台数秒内生效；库存为 0 的商品前台显示"售罄"

### 改后台密码

新密码取 SHA-256 后更新环境变量（三个环境都要）：

```bash
printf '%s' '新密码' | shasum -a 256          # 得到哈希
npx vercel env rm ADMIN_PASS_SHA256 production
printf '%s' '哈希值' | npx vercel env add ADMIN_PASS_SHA256 production
# preview / development 同理，然后 vercel --prod 重新部署生效
```

环境变量：`ADMIN_USER`（账号）、`ADMIN_PASS_SHA256`（密码哈希）、`SESSION_SECRET`（会话签名密钥）、
`BLOB_READ_WRITE_TOKEN`（Blob store 关联时自动注入）。

## 本地开发

```bash
npm install
npx vercel env pull .env.local   # 拉取环境变量
npx vercel dev                   # 带 API 的本地环境
```

## 部署

push 到 `main` 即自动部署生产（已关联 GitHub 仓库）。

## 待替换内容

- 种子商品为占位数据，正式上架前在后台逐个替换或删除
- 页脚小红书账号、邮箱 `hello@hillmoon.example` 为占位，在三个 HTML 和 `js/i18n.js` 中替换
