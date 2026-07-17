/* 商品详情页：?id=<商品id> */

(function () {
  const root = document.getElementById("detail-root");
  const id = new URLSearchParams(location.search).get("id");
  let product = null;
  let qty = 1;

  function render() {
    if (!product) {
      root.innerHTML = `
        <div class="detail-notfound">
          <p class="filter-empty">${t("detail.notFound")}</p>
          <p style="text-align:center;"><a class="btn btn-dark" href="products">${t("cart.goShopping")}</a></p>
        </div>`;
      return;
    }
    const p = product;
    const lang = getLang();
    const name = p.name[lang] || p.name.vi;
    const soldout = p.stock <= 0;
    const desc = (p.desc && (p.desc[lang] || p.desc.vi)) || t(`mat.${p.mat}.desc`);
    document.title = `${name} · HillMoon`;

    root.innerHTML = `
      <p class="detail-back"><a href="products">${t("detail.back")}</a></p>
      <div class="detail-grid">
        <div class="detail-art">
          ${p.tag ? `<span class="product-tag">${t("tag." + p.tag)}</span>` : ""}
          ${soldout ? `<span class="product-soldout">${t("product.soldout")}</span>` : ""}
          ${productArt(p, name)}
        </div>
        <div class="detail-info">
          <p class="detail-crumbs">${t("cat." + p.cat)} · ${t("mat." + p.mat)}</p>
          <h1 class="detail-name">${name}</h1>
          <p class="detail-price">${fmtPrice(p.price)}</p>
          <p class="detail-stock ${soldout ? "out" : ""}">${soldout ? t("product.soldout") : t("detail.instock")}</p>
          <p class="detail-desc">${desc}</p>

          <div class="detail-qty">
            <span class="qty-label">${t("detail.qty")}</span>
            <div class="qty-stepper">
              <button type="button" data-step="-1" aria-label="−">−</button>
              <span class="qty-val">${qty}</span>
              <button type="button" data-step="1" aria-label="+">＋</button>
            </div>
          </div>

          <div class="detail-actions">
            <button class="btn btn-solid detail-btn" data-act="buy" ${soldout ? "disabled" : ""}>${t("detail.buyNow")}</button>
            <button class="btn btn-dark detail-btn" data-act="cart" ${soldout ? "disabled" : ""}>${t("detail.addCart")}</button>
          </div>

          <button class="product-preorder detail-preorder" type="button" data-act="pre">
            <span>${t("preorder.label")}</span>
            <span class="early">${fmtPrice(earlyPrice(p.price))}</span>
          </button>
          <p class="detail-hint">${t("preorder.hint")}</p>
        </div>
      </div>`;
  }

  root.addEventListener("click", (e) => {
    const step = e.target.closest("[data-step]");
    if (step && product) {
      const max = product.stock > 0 ? Math.min(99, product.stock) : 99;
      qty = Math.min(max, Math.max(1, qty + Number(step.dataset.step)));
      root.querySelector(".qty-val").textContent = qty;
      return;
    }
    const act = e.target.closest("[data-act]");
    if (!act || !product) return;
    if (act.dataset.act === "cart") addToCart(product.id, qty, false);
    if (act.dataset.act === "pre") addToCart(product.id, qty, true);
    if (act.dataset.act === "buy") {
      addToCart(product.id, qty, false);
      location.href = "cart";
    }
  });

  document.addEventListener("hm:langchange", render);

  loadCatalog()
    .then((doc) => {
      product = doc.products.find((p) => p.id === id && p.visible) || null;
      render();
    })
    .catch(() => {
      product = null;
      render();
    });
})();
