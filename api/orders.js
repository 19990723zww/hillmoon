import crypto from "crypto";
import { put, list, del, copy } from "@vercel/blob";
import { isAuthed, readCatalog } from "./_utils.js";

/* 订单以 orders/<单号>__<状态>.json 存储：内容不可变（规避 CDN 缓存延迟），
   改状态 = copy 到新文件名 + 删旧文件 */

const ORDER_PREFIX = "orders/";
const STATUSES = ["new", "confirmed", "shipped", "done"];

function earlyPrice(price) {
  return Math.round((price * 0.9) / 1000) * 1000;
}

function parsePathname(pathname) {
  const m = pathname.match(/^orders\/([A-Z0-9-]+)__([a-z]+)\.json$/);
  return m ? { no: m[1], status: m[2] } : null;
}

async function createOrder(body) {
  const { customer, items } = body || {};
  const name = String(customer?.name || "").trim().slice(0, 80);
  const phone = String(customer?.phone || "").trim().slice(0, 32);
  const address = String(customer?.address || "").trim().slice(0, 300);
  const note = String(customer?.note || "").trim().slice(0, 500);
  if (!name || !phone || !address) throw new Error("missing customer info");
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new Error("bad items");

  const catalog = await readCatalog();
  const lines = items.map((it) => {
    const p = catalog.products.find((x) => x.id === it.id && x.visible);
    if (!p) throw new Error(`unknown product: ${it.id}`);
    const qty = Math.max(1, Math.min(99, Math.round(Number(it.qty) || 1)));
    const preorder = !!it.preorder;
    const unit = preorder ? earlyPrice(p.price) : p.price;
    return { id: p.id, name: p.name, qty, preorder, unit, sum: unit * qty };
  });

  const no = `HM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
  const order = {
    no,
    ts: Date.now(),
    status: "new",
    lang: ["vi", "en", "zh"].includes(body.lang) ? body.lang : "vi",
    customer: { name, phone, address, note },
    items: lines,
    total: lines.reduce((s, l) => s + l.sum, 0),
  };
  await put(`${ORDER_PREFIX}${no}__new.json`, JSON.stringify(order), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  return { ok: true, no };
}

async function listOrders() {
  const { blobs } = await list({ prefix: ORDER_PREFIX, limit: 500 });
  const recent = blobs
    .map((b) => ({ ...b, meta: parsePathname(b.pathname) }))
    .filter((b) => b.meta)
    .sort((a, b) => (a.pathname < b.pathname ? 1 : -1))
    .slice(0, 100);
  const orders = await Promise.all(
    recent.map(async (b) => {
      try {
        const res = await fetch(b.url, { cache: "no-store" });
        const o = await res.json();
        return { ...o, status: b.meta.status, pathname: b.pathname };
      } catch {
        return null;
      }
    })
  );
  return orders.filter(Boolean).sort((a, b) => b.ts - a.ts);
}

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const result = await createOrder(req.body);
      return res.status(200).json(result);
    }

    if (!isAuthed(req)) return res.status(401).json({ error: "未登录" });

    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ orders: await listOrders() });
    }

    if (req.method === "PATCH") {
      const { pathname, status } = req.body || {};
      const meta = parsePathname(String(pathname || ""));
      if (!meta || !STATUSES.includes(status)) return res.status(400).json({ error: "bad request" });
      if (meta.status === status) return res.status(200).json({ ok: true, pathname });
      const newPathname = `${ORDER_PREFIX}${meta.no}__${status}.json`;
      await copy(pathname, newPathname, { access: "public", addRandomSuffix: false });
      await del(pathname);
      return res.status(200).json({ ok: true, pathname: newPathname });
    }

    if (req.method === "DELETE") {
      const meta = parsePathname(String(req.body?.pathname || ""));
      if (!meta) return res.status(400).json({ error: "bad request" });
      await del(req.body.pathname);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    const msg = String(e.message || e);
    const code = /missing|bad|unknown/.test(msg) ? 400 : 500;
    return res.status(code).json({ error: msg });
  }
}
