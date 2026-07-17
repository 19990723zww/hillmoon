/* 商品渲染：数据来自 /api/products，实拍图优先，否则按材质生成线描插画 */

const MATERIAL_STYLE = {
  pearl:    { fill: "#F3EAD5", edge: "#CBB080" },
  crystal:  { fill: "#DDD3E8", edge: "#AC9FC2" },
  ceramic:  { fill: "#A9C2B1", edge: "#7E9C8A" },
  silver:   { fill: "#D3D6D2", edge: "#A2A8A2" },
  titanium: { fill: "#7C857F", edge: "#59635C" },
};

const GILT = "#B08F55";

function bead(cx, cy, r, s) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${s.fill}" stroke="${s.edge}" stroke-width="0.8"/>
    <circle cx="${cx - r * 0.3}" cy="${cy - r * 0.35}" r="${r * 0.22}" fill="#FFFFFF" opacity="0.55"/>`;
}

function artNecklace(s) {
  const beads = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const x = 40 + t * 120;
    const y = 52 + Math.sin(t * Math.PI) * 66;
    beads.push(bead(x, y, i === 5 ? 0 : 4.6, s));
  }
  return `
    <path d="M40 52 Q100 190 160 52" fill="none" stroke="${GILT}" stroke-width="1.4"/>
    ${beads.join("")}
    <line x1="100" y1="121" x2="100" y2="136" stroke="${GILT}" stroke-width="1.2"/>
    ${bead(100, 146, 9.5, s)}`;
}

function artBracelet(s) {
  const beads = [];
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    beads.push(bead(100 + Math.cos(a) * 52, 104 + Math.sin(a) * 52, 7.2, s));
  }
  return `
    <circle cx="100" cy="104" r="52" fill="none" stroke="${GILT}" stroke-width="1.4"/>
    ${beads.join("")}`;
}

function artEarring(s) {
  const one = (ox) => `
    <path d="M${ox} 58 q10 -18 20 0 q4 8 -2 14" fill="none" stroke="${GILT}" stroke-width="1.6"/>
    <line x1="${ox + 18}" y1="72" x2="${ox + 18}" y2="94" stroke="${GILT}" stroke-width="1.2"/>
    ${bead(ox + 18, 103, 8.5, s)}
    <line x1="${ox + 18}" y1="112" x2="${ox + 18}" y2="126" stroke="${GILT}" stroke-width="1.2"/>
    ${bead(ox + 18, 133, 5.5, s)}`;
  return one(48) + one(116);
}

const ART = { necklace: artNecklace, bracelet: artBracelet, earring: artEarring };

function productArt(p, name) {
  if (p.img) {
    return `<img src="${p.img}" alt="${name}" loading="lazy"
      style="width:100%;height:100%;object-fit:cover;">`;
  }
  const s = MATERIAL_STYLE[p.mat];
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${name}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="86" fill="none" stroke="${GILT}" stroke-width="0.7" opacity="0.45"/>
    ${ART[p.cat](s)}
  </svg>`;
}

function productCard(p) {
  const lang = getLang();
  const name = p.name[lang] || p.name.vi;
  const soldout = p.stock <= 0;
  return `
  <article class="product-card reveal" data-cat="${p.cat}" data-mat="${p.mat}">
    <div class="product-art">
      ${p.tag ? `<span class="product-tag">${t("tag." + p.tag)}</span>` : ""}
      ${soldout ? `<span class="product-soldout">${t("product.soldout")}</span>` : ""}
      ${productArt(p, name)}
    </div>
    <div class="product-info">
      <h3 class="product-name">${name}</h3>
      <div class="product-meta">
        <span class="product-material">${t("mat." + p.mat)}</span>
        <span class="product-price">${fmtPrice(p.price)}</span>
      </div>
    </div>
  </article>`;
}

function renderProducts(el, list) {
  el.innerHTML = list.map(productCard).join("");
}

let _catalog = null;

async function loadCatalog() {
  if (_catalog) return _catalog;
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("catalog fetch failed");
  _catalog = await res.json();
  return _catalog;
}

function publicProducts(doc) {
  const cats = doc.settings.visibleCats;
  return doc.products.filter((p) => p.visible && cats.includes(p.cat));
}
