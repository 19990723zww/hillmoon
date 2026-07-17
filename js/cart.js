/* 购物车页：条目管理 + 下单 */

(function () {
  const root = document.getElementById("cart-root");
  let catalog = null;
  let orderNo = null;

  function lines() {
    if (!catalog) return [];
    return getCart()
      .map((item) => {
        const p = catalog.products.find((x) => x.id === item.id && x.visible);
        if (!p) return null;
        const unit = item.preorder ? earlyPrice(p.price) : p.price;
        return { ...item, p, unit, sum: unit * item.qty };
      })
      .filter(Boolean);
  }

  function render() {
    const lang = getLang();

    if (orderNo) {
      root.innerHTML = `
        <div class="cart-success">
          <h2>${t("checkout.success")}</h2>
          <p>${t("checkout.successBody").replace("{no}", orderNo)}</p>
          <a class="btn btn-dark" href="products">${t("cart.goShopping")}</a>
        </div>`;
      return;
    }

    const ls = lines();
    if (!ls.length) {
      root.innerHTML = `
        <div class="cart-success">
          <p class="filter-empty">${t("cart.empty")}</p>
          <a class="btn btn-dark" href="products">${t("cart.goShopping")}</a>
        </div>`;
      return;
    }

    const total = ls.reduce((s, l) => s + l.sum, 0);
    root.innerHTML = `
      <div class="cart-grid">
        <div class="cart-items">
          ${ls.map((l, i) => {
            const name = l.p.name[lang] || l.p.name.vi;
            return `
            <div class="cart-item" data-i="${i}">
              <a class="cart-thumb" href="product?id=${l.p.id}">${productArt(l.p, name)}</a>
              <div class="cart-item-info">
                <a class="cart-item-name" href="product?id=${l.p.id}">${name}</a>
                <p class="cart-item-meta">
                  ${t("mat." + l.p.mat)}
                  ${l.preorder ? `<span class="cart-pre-tag">${t("cart.preorderTag")} −10%</span>` : ""}
                </p>
                <div class="cart-item-row">
                  <div class="qty-stepper">
                    <button type="button" data-step="-1" aria-label="−">−</button>
                    <span class="qty-val">${l.qty}</span>
                    <button type="button" data-step="1" aria-label="+">＋</button>
                  </div>
                  <span class="cart-item-price">${fmtPrice(l.sum)}</span>
                </div>
                <button class="cart-remove" type="button" data-remove>${t("cart.remove")}</button>
              </div>
            </div>`;
          }).join("")}
          <div class="cart-total">
            <span>${t("cart.total")}</span>
            <span class="cart-total-num">${fmtPrice(total)}</span>
          </div>
        </div>

        <form class="checkout-form" id="checkout-form">
          <h2>${t("checkout.title")}</h2>
          <div class="admin-field">
            <label for="co-name">${t("checkout.name")}</label>
            <input class="admin-input" id="co-name" required maxlength="80" autocomplete="name">
          </div>
          <div class="admin-field">
            <label for="co-phone">${t("checkout.phone")}</label>
            <input class="admin-input" id="co-phone" required maxlength="32" autocomplete="tel" inputmode="tel">
          </div>
          <div class="admin-field">
            <label for="co-addr">${t("checkout.address")}</label>
            <textarea class="admin-input" id="co-addr" required maxlength="300" rows="3" autocomplete="street-address"></textarea>
          </div>
          <div class="admin-field">
            <label for="co-note">${t("checkout.note")}</label>
            <input class="admin-input" id="co-note" maxlength="500">
          </div>
          <p class="checkout-paynote">${t("checkout.payNote")}</p>
          <p class="admin-error" id="checkout-error"></p>
          <button class="btn btn-solid" type="submit" style="width:100%;">${t("checkout.submit")}</button>
        </form>
      </div>`;
  }

  root.addEventListener("click", (e) => {
    const itemEl = e.target.closest(".cart-item");
    if (!itemEl) return;
    const ls = lines();
    const line = ls[Number(itemEl.dataset.i)];
    if (!line) return;
    const cart = getCart();
    const idx = cart.findIndex((x) => x.id === line.id && !!x.preorder === !!line.preorder);
    if (idx < 0) return;

    if (e.target.closest("[data-remove]")) {
      cart.splice(idx, 1);
      setCart(cart);
      render();
      return;
    }
    const step = e.target.closest("[data-step]");
    if (step) {
      const max = line.preorder ? 99 : Math.max(1, Math.min(99, line.p.stock));
      cart[idx].qty = Math.min(max, Math.max(1, cart[idx].qty + Number(step.dataset.step)));
      setCart(cart);
      render();
    }
  });

  root.addEventListener("submit", async (e) => {
    if (e.target.id !== "checkout-form") return;
    e.preventDefault();
    const errEl = document.getElementById("checkout-error");
    const btn = e.target.querySelector('button[type="submit"]');
    errEl.textContent = "";
    btn.disabled = true;
    btn.textContent = t("checkout.sending");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: document.getElementById("co-name").value.trim(),
            phone: document.getElementById("co-phone").value.trim(),
            address: document.getElementById("co-addr").value.trim(),
            note: document.getElementById("co-note").value.trim(),
          },
          items: getCart().map(({ id, qty, preorder }) => ({ id, qty, preorder: !!preorder })),
          lang: getLang(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      orderNo = data.no;
      setCart([]);
      render();
      window.scrollTo(0, 0);
    } catch (err) {
      errEl.textContent = `${t("checkout.fail")} (${err.message})`;
      btn.disabled = false;
      btn.textContent = t("checkout.submit");
    }
  });

  document.addEventListener("hm:langchange", render);

  loadCatalog()
    .then((doc) => {
      catalog = doc;
      render();
    })
    .catch(() => {
      root.innerHTML = `<p class="filter-empty">—</p>`;
    });
})();
