/* 商品数据与鎏金线描插画 */

const MATERIAL_STYLE = {
  珍珠: { fill: "#F3EAD5", edge: "#CBB080", latin: "Pearl" },
  水晶: { fill: "#DDD3E8", edge: "#AC9FC2", latin: "Crystal" },
  陶瓷: { fill: "#A9C2B1", edge: "#7E9C8A", latin: "Ceramic" },
  镀银: { fill: "#D3D6D2", edge: "#A2A8A2", latin: "Silver-plated" },
  钢钛: { fill: "#7C857F", edge: "#59635C", latin: "Titanium Steel" },
};

const PRODUCTS = [
  { id: "yingyue",  name: "映月 · 淡水珍珠项链",  cat: "项链", mat: "珍珠", price: 489, tag: "主打", featured: true },
  { id: "shanlan",  name: "山岚 · 白水晶手链",    cat: "手链", mat: "水晶", price: 329, featured: true },
  { id: "qingciyue",name: "青瓷月 · 陶瓷耳坠",    cat: "耳饰", mat: "陶瓷", price: 259, tag: "新品", featured: true },
  { id: "suxian",   name: "素弦 · 镀银锁骨链",    cat: "项链", mat: "镀银", price: 399, featured: true },
  { id: "mofeng",   name: "墨峰 · 钛钢手环",      cat: "手链", mat: "钢钛", price: 349, featured: true },
  { id: "yueman",   name: "月满 · 珍珠耳钉",      cat: "耳饰", mat: "珍珠", price: 219, featured: true },
  { id: "yanshui",  name: "烟水 · 紫水晶项链",    cat: "项链", mat: "水晶", price: 459 },
  { id: "diezhang", name: "叠嶂 · 陶瓷串珠手链",  cat: "手链", mat: "陶瓷", price: 289, tag: "新品" },
  { id: "shuangzhi",name: "霜枝 · 镀银耳线",      cat: "耳饰", mat: "镀银", price: 239 },
  { id: "zhi",      name: "峙 · 钛钢项圈",        cat: "项链", mat: "钢钛", price: 429 },
  { id: "shilu",    name: "拾露 · 珍珠手链",      cat: "手链", mat: "珍珠", price: 359 },
  { id: "kongshan", name: "空山 · 水晶耳饰",      cat: "耳饰", mat: "水晶", price: 269 },
];

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

const ART = { 项链: artNecklace, 手链: artBracelet, 耳饰: artEarring };

function productSVG(p) {
  const s = MATERIAL_STYLE[p.mat];
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${p.name} 插画" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="86" fill="none" stroke="${GILT}" stroke-width="0.7" opacity="0.45"/>
    ${ART[p.cat](s)}
  </svg>`;
}

function productCard(p) {
  const s = MATERIAL_STYLE[p.mat];
  return `
  <article class="product-card reveal" data-cat="${p.cat}" data-mat="${p.mat}">
    <div class="product-art">
      ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ""}
      ${productSVG(p)}
    </div>
    <div class="product-info">
      <h3 class="product-name">${p.name}</h3>
      <div class="product-meta">
        <span class="product-material">${p.mat} · ${s.latin}</span>
        <span class="product-price">¥ ${p.price}</span>
      </div>
    </div>
  </article>`;
}

function renderProducts(el, list) {
  el.innerHTML = list.map(productCard).join("");
}
