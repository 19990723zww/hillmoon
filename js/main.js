/* 滚动入场 + 首页精选 + 商品页筛选 */

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

document.addEventListener("DOMContentLoaded", () => {
  const featuredEl = document.getElementById("featured-grid");
  if (featuredEl) {
    renderProducts(featuredEl, PRODUCTS.filter((p) => p.featured));
  }

  const catalogEl = document.getElementById("catalog-grid");
  if (catalogEl) {
    const state = { cat: "全部", mat: "全部" };
    const emptyEl = document.getElementById("catalog-empty");

    const apply = () => {
      const list = PRODUCTS.filter(
        (p) =>
          (state.cat === "全部" || p.cat === state.cat) &&
          (state.mat === "全部" || p.mat === state.mat)
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
  }

  watchReveals();
});
