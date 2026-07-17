import { isAuthed, readCatalog, writeCatalog } from "./_utils.js";

const CATS = ["bracelet", "necklace", "earring"];
const MATS = ["pearl", "crystal", "ceramic", "silver", "titanium"];

function sanitize(doc) {
  if (!doc || !Array.isArray(doc.products)) throw new Error("bad payload");
  const visibleCats = (doc.settings?.visibleCats || []).filter((c) => CATS.includes(c));
  const products = doc.products.map((p, i) => {
    if (!CATS.includes(p.cat) || !MATS.includes(p.mat)) throw new Error(`bad product #${i}`);
    return {
      id: String(p.id || `p${Date.now()}${i}`).slice(0, 64),
      cat: p.cat,
      mat: p.mat,
      price: Math.max(0, Math.round(Number(p.price) || 0)),
      stock: Math.max(0, Math.round(Number(p.stock) || 0)),
      tag: ["new", "hero"].includes(p.tag) ? p.tag : "",
      featured: !!p.featured,
      visible: !!p.visible,
      img: typeof p.img === "string" && p.img.startsWith("https://") ? p.img : null,
      name: {
        vi: String(p.name?.vi || "").slice(0, 200),
        en: String(p.name?.en || "").slice(0, 200),
        zh: String(p.name?.zh || "").slice(0, 200),
      },
    };
  });
  return { settings: { visibleCats }, products };
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const doc = await readCatalog();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(doc);
    }

    if (req.method === "PUT") {
      if (!isAuthed(req)) return res.status(401).json({ error: "未登录" });
      const doc = sanitize(req.body);
      await writeCatalog(doc);
      return res.status(200).json({ ok: true, count: doc.products.length });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
