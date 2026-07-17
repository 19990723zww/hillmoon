import crypto from "crypto";
import { put, list, del } from "@vercel/blob";
import { SEED } from "./_seed.js";

const COOKIE = "hm_session";
const DATA_PREFIX = "data/catalog-";

export function sessionCookie(maxAgeDays = 7) {
  const exp = Date.now() + maxAgeDays * 864e5;
  const sig = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(String(exp))
    .digest("hex");
  return `${COOKIE}=${exp}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeDays * 86400}`;
}

export function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function isAuthed(req) {
  try {
    const pair = (req.headers.cookie || "")
      .split(/;\s*/)
      .find((c) => c.startsWith(COOKIE + "="));
    if (!pair) return false;
    const [exp, sig] = pair.slice(COOKIE.length + 1).split(".");
    if (!exp || !sig || Number(exp) < Date.now()) return false;
    const good = crypto
      .createHmac("sha256", process.env.SESSION_SECRET)
      .update(String(exp))
      .digest("hex");
    return (
      sig.length === good.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))
    );
  } catch {
    return false;
  }
}

export function checkLogin(user, pass) {
  const hash = crypto.createHash("sha256").update(String(pass)).digest("hex");
  const u = Buffer.from(String(user));
  const eu = Buffer.from(process.env.ADMIN_USER || "");
  const h = Buffer.from(hash);
  const eh = Buffer.from(process.env.ADMIN_PASS_SHA256 || "");
  const userOk = u.length === eu.length && crypto.timingSafeEqual(u, eu);
  const passOk = h.length === eh.length && crypto.timingSafeEqual(h, eh);
  return userOk && passOk;
}

/* 覆盖同一路径的写入受 CDN 缓存影响（最长 60s 才全局生效），
   因此每次保存写入带时间戳的新文件（新对象读取即时一致），
   读取时按文件名取最新版本，写入后清理旧版本只留最近 3 份 */

function latest(blobs) {
  return [...blobs].sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
}

export async function readCatalog() {
  const { blobs } = await list({ prefix: DATA_PREFIX, limit: 1000 });
  if (!blobs.length) return SEED;
  const res = await fetch(latest(blobs)[0].url, { cache: "no-store" });
  if (!res.ok) throw new Error(`blob fetch ${res.status}`);
  return await res.json();
}

export async function writeCatalog(doc) {
  const ts = String(Date.now()).padStart(14, "0");
  await put(`${DATA_PREFIX}${ts}.json`, JSON.stringify(doc), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  try {
    const { blobs } = await list({ prefix: DATA_PREFIX, limit: 1000 });
    const old = latest(blobs).slice(3);
    if (old.length) await del(old.map((b) => b.url));
  } catch {
    /* 清理失败不影响保存 */
  }
}
