/* 滚动入场 + 首页精选 + 商品页筛选（数据来自 /api/products） */

function watchReveals(scope = document) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("shown");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  scope.querySelectorAll(".reveal:not(.shown)").forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", async () => {
  watchReveals();

  const featuredEl = document.getElementById("featured-grid");
  const catalogEl = document.getElementById("catalog-grid");
  if (!featuredEl && !catalogEl) return;

  let doc;
  try {
    doc = await loadCatalog();
  } catch {
    const grid = featuredEl || catalogEl;
    grid.innerHTML = `<p class="filter-empty">—</p>`;
    return;
  }

  if (featuredEl) {
    const drawFeatured = () => {
      renderProducts(featuredEl, publicProducts(doc).filter((p) => p.featured));
      watchReveals(featuredEl);
    };
    drawFeatured();
    document.addEventListener("hm:langchange", drawFeatured);
  }

  if (catalogEl) {
    const state = { cat: "all", mat: "all" };
    const emptyEl = document.getElementById("catalog-empty");

    // 隐藏未上架的类别按钮
    document
      .querySelectorAll('.filter-group[data-key="cat"] .filter-btn')
      .forEach((b) => {
        if (b.dataset.value !== "all" && !doc.settings.visibleCats.includes(b.dataset.value)) {
          b.hidden = true;
        }
      });

    const apply = () => {
      const list = publicProducts(doc).filter(
        (p) =>
          (state.cat === "all" || p.cat === state.cat) &&
          (state.mat === "all" || p.mat === state.mat)
      );
      renderProducts(catalogEl, list);
      emptyEl.hidden = list.length > 0;
      watchReveals(catalogEl);
    };

    document.querySelectorAll(".filter-group").forEach((group) => {
      const key = group.dataset.key;
      group.addEventListener("click", (ev) => {
        const btn = ev.target.closest(".filter-btn");
        if (!btn) return;
        state[key] = btn.dataset.value;
        group.querySelectorAll(".filter-btn").forEach((b) =>
          b.classList.toggle("active", b === btn)
        );
        apply();
      });
    });

    apply();
    document.addEventListener("hm:langchange", apply);
  }
});
