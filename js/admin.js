/* 后台：登录 + 商品管理（图片上传 / 增删改 / 价格库存 / 类别显隐） */

const CATS = { bracelet: "手链", necklace: "项链", earring: "耳饰" };
const MATS = { pearl: "珍珠", crystal: "水晶", ceramic: "陶瓷", silver: "镀银", titanium: "钢钛" };
const TAGS = { "": "无标签", new: "新品", hero: "主打" };

let doc = null;

const $ = (sel) => document.querySelector(sel);

function toast(msg, isErr = false) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("err", isErr);
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* ———— 登录 ———— */

async function boot() {
  const { authed } = await api("/api/login");
  $("#login-box").hidden = authed;
  $("#dashboard").hidden = !authed;
  $("#logout-link").hidden = !authed;
  if (authed) await loadDashboard();
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#login-error").textContent = "";
  try {
    await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ user: $("#login-user").value.trim(), pass: $("#login-pass").value }),
    });
    await boot();
  } catch (err) {
    $("#login-error").textContent = err.message;
  }
});

$("#logout-link").addEventListener("click", async (e) => {
  e.preventDefault();
  await api("/api/login", { method: "DELETE" });
  location.reload();
});

/* ———— 数据 ———— */

async function loadDashboard() {
  doc = await api("/api/products");
  $("#cat-toggles").querySelectorAll("input").forEach((cb) => {
    cb.checked = doc.settings.visibleCats.includes(cb.value);
  });
  renderList();
}

function options(map, selected) {
  return Object.entries(map)
    .map(([v, label]) => `<option value="${v}" ${v === selected ? "selected" : ""}>${label}</option>`)
    .join("");
}

function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function rowHTML(p, i) {
  return `
  <article class="admin-row" data-i="${i}">
    <div>
      <div class="admin-thumb" data-field="img" title="点击上传图片">
        ${p.img ? `<img src="${p.img}" alt="">` : "点击上传<br>商品图"}
      </div>
      ${p.img ? `<button class="admin-del" data-imgdel type="button" style="margin-top:6px;">移除图片</button>` : ""}
    </div>
    <div class="admin-fields">
      <input class="admin-input fw" data-field="name.vi" value="${esc(p.name.vi)}" placeholder="商品名（越南语，主语言）">
      <input class="admin-input" data-field="name.en" value="${esc(p.name.en)}" placeholder="商品名（英语）">
      <input class="admin-input" data-field="name.zh" value="${esc(p.name.zh)}" placeholder="商品名（中文）">
      <label class="admin-mini">类别
        <select class="admin-select" data-field="cat">${options(CATS, p.cat)}</select>
      </label>
      <label class="admin-mini">材质
        <select class="admin-select" data-field="mat">${options(MATS, p.mat)}</select>
      </label>
      <label class="admin-mini">标签
        <select class="admin-select" data-field="tag">${options(TAGS, p.tag)}</select>
      </label>
      <label class="admin-mini">价格 ₫
        <input class="admin-input" data-field="price" type="number" min="0" step="1000" value="${p.price}">
      </label>
      <label class="admin-mini">库存
        <input class="admin-input" data-field="stock" type="number" min="0" value="${p.stock}">
      </label>
      <div class="admin-row-foot">
        <div class="admin-checks">
          <label class="admin-mini"><input type="checkbox" data-field="visible" ${p.visible ? "checked" : ""}> 上架显示</label>
          <label class="admin-mini"><input type="checkbox" data-field="featured" ${p.featured ? "checked" : ""}> 首页精选</label>
        </div>
        <button class="admin-del" data-del type="button">删除此商品</button>
      </div>
    </div>
  </article>`;
}

function renderList() {
  $("#admin-list").innerHTML = doc.products.map(rowHTML).join("");
}

/* ———— 编辑 ———— */

function setField(p, path, value) {
  if (path.startsWith("name.")) p.name[path.slice(5)] = value;
  else if (path === "price" || path === "stock") p[path] = Number(value) || 0;
  else if (path === "visible" || path === "featured") p[path] = value;
  else p[path] = value;
}

$("#admin-list").addEventListener("input", (e) => {
  const row = e.target.closest(".admin-row");
  const field = e.target.dataset.field;
  if (!row || !field) return;
  const p = doc.products[Number(row.dataset.i)];
  setField(p, field, e.target.type === "checkbox" ? e.target.checked : e.target.value);
});

$("#admin-list").addEventListener("click", async (e) => {
  const row = e.target.closest(".admin-row");
  if (!row) return;
  const i = Number(row.dataset.i);

  if (e.target.closest("[data-imgdel]")) {
    doc.products[i].img = null;
    renderList();
    return;
  }

  if (e.target.closest("[data-del]")) {
    const name = doc.products[i].name.zh || doc.products[i].name.vi || "未命名";
    if (confirm(`确定删除「${name}」？保存后生效。`)) {
      doc.products.splice(i, 1);
      renderList();
    }
    return;
  }

  const thumb = e.target.closest(".admin-thumb");
  if (thumb) pickImage(i, thumb);
});

$("#cat-toggles").addEventListener("change", () => {
  doc.settings.visibleCats = [...$("#cat-toggles").querySelectorAll("input:checked")].map((c) => c.value);
});

$("#add-btn").addEventListener("click", () => {
  doc.products.unshift({
    id: "p" + Date.now(),
    cat: "bracelet", mat: "pearl", price: 0, stock: 0,
    tag: "", featured: false, visible: false, img: null,
    name: { vi: "", en: "", zh: "" },
  });
  renderList();
  $("#admin-list").scrollIntoView({ behavior: "smooth" });
});

$("#save-btn").addEventListener("click", async () => {
  try {
    const r = await api("/api/products", { method: "PUT", body: JSON.stringify(doc) });
    toast(`已保存，共 ${r.count} 件商品，前台数秒内生效`);
  } catch (err) {
    toast("保存失败：" + err.message, true);
  }
});

/* ———— 图片上传（前端压缩到 1200px JPEG） ———— */

function pickImage(i, thumb) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp";
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    const busy = document.createElement("div");
    busy.className = "busy";
    busy.textContent = "上传中…";
    thumb.appendChild(busy);
    try {
      const { blob, type } = await compress(file);
      const b64 = await toBase64(blob);
      const r = await api("/api/upload", {
        method: "POST",
        body: JSON.stringify({ type, data: b64 }),
      });
      doc.products[i].img = r.url;
      thumb.innerHTML = `<img src="${r.url}" alt="">`;
      toast("图片已上传，记得点「保存全部」");
    } catch (err) {
      busy.remove();
      toast("上传失败：" + err.message, true);
    }
  };
  input.click();
}

function compress(file, max = 1200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve({ blob, type: "image/jpeg" }) : reject(new Error("压缩失败"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => reject(new Error("无法读取图片"));
    img.src = URL.createObjectURL(file);
  });
}

function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result).split(",")[1]);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}

boot().catch((e) => toast(e.message, true));
