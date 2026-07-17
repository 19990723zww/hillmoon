import { put } from "@vercel/blob";
import { isAuthed } from "./_utils.js";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }
  if (!isAuthed(req)) return res.status(401).json({ error: "未登录" });

  try {
    const { type, data } = req.body || {};
    const ext = TYPES[type];
    if (!ext) return res.status(400).json({ error: "仅支持 JPG / PNG / WebP" });
    const buf = Buffer.from(String(data || ""), "base64");
    if (!buf.length) return res.status(400).json({ error: "空文件" });
    if (buf.length > 4 * 1024 * 1024) return res.status(413).json({ error: "图片超过 4MB" });

    const blob = await put(`img/${Date.now()}.${ext}`, buf, {
      access: "public",
      contentType: type,
    });
    return res.status(200).json({ ok: true, url: blob.url });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
