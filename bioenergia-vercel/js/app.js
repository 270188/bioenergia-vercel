const CATEGORY_LABELS = {
  todos: "Todos",
  agua: "Agua & Bienestar",
  pulseras: "Pulseras & Joyería FIR",
  calzado: "Calzado & Plantillas",
  textil: "Textil Bioceramico",
  soportes: "Soportes Deportivos",
  hogar: "Hogar & Auto",
  kits: "Wellness Kits"
};

const state = {
  products: [],
  categories: [],
  activeCategory: "todos",
  searchTerm: "",
  cart: JSON.parse(localStorage.getItem("bioenergia_cart") || "[]"),
  distributor: null
};

const money = (n) => `$${Number(n).toLocaleString("en-US")}`;

// ---------- Fetch helpers ----------
async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Error en ${url}`);
  return res.json();
}

// ---------- Init ----------
async function init() {
  buildIonField();

  try {
    const [products, categories, distributor] = await Promise.all([
      fetchJSON("/api/products"),
      fetchJSON("/api/categories"),
      fetchJSON("/api/distributor")
    ]);
    state.products = products;
    state.categories = categories;
    state.distributor = distributor;

    document.getElementById("statProducts").textContent = products.length;
    setupDistributorLinks();
    renderFilters();
    renderKits();
    renderCatalog();
  } catch (err) {
    console.error("No se pudo conectar con el backend:", err);
    document.getElementById("productGrid").innerHTML =
      `<p style="grid-column:1/-1;text-align:center;color:#94433a">No se pudo cargar el catálogo. Verifica que el backend esté corriendo (npm start).</p>`;
  }

  renderCart();
  bindEvents();
}

// ---------- Hero ion field (decorative) ----------
function buildIonField() {
  const g = document.getElementById("ionField");
  const points = [];
  for (let i = 0; i < 26; i++) {
    points.push({
      x: Math.random() * 900,
      y: Math.random() * 600,
      r: Math.random() * 3 + 2
    });
  }
  points.forEach((p, i) => {
    // connect to 1-2 nearest neighbours for the "ion network" look
    const others = points
      .map((o, j) => ({ o, j, d: Math.hypot(o.x - p.x, o.y - p.y) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    others.forEach(({ o }) => {
      if (o.d < 180) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p.x);
        line.setAttribute("y1", p.y);
        line.setAttribute("x2", o.x);
        line.setAttribute("y2", o.y);
        line.setAttribute("stroke", "rgba(111,211,206,0.25)");
        line.setAttribute("stroke-width", "1");
        g.appendChild(line);
      }
    });
  });
  points.forEach((p) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", p.r);
    circle.setAttribute("fill", "rgba(111,211,206,0.55)");
    g.appendChild(circle);
  });
}

// ---------- Distributor links ----------
function setupDistributorLinks() {
  const msg = encodeURIComponent(
    "Hola Nancy, vengo del catálogo Bioenergía y quisiera más información sobre los productos Nipponflex."
  );
  const waLink = `https://wa.me/${state.distributor.whatsapp}?text=${msg}`;
  document.getElementById("heroWhatsapp").href = waLink;
  document.getElementById("contactWhatsapp").href = waLink;
  document.getElementById("contactPhoneLink").href = `tel:${state.distributor.phone}`;
  document.getElementById("contactPhoneLink").textContent = state.distributor.phone;
}

// ---------- Filters ----------
function renderFilters() {
  const container = document.getElementById("categoryFilters");
  const cats = ["todos", ...state.categories];
  container.innerHTML = cats
    .map(
      (c) =>
        `<button class="filter ${c === "todos" ? "active" : ""}" data-category="${c}">${CATEGORY_LABELS[c] || c}</button>`
    )
    .join("");

  container.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeCategory = btn.dataset.category;
      container.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCatalog();
    });
  });
}

// ---------- Kits ----------
function renderKits() {
  const kits = state.products.filter((p) => p.category === "kits");
  const grid = document.getElementById("kitsGrid");
  grid.innerHTML = kits
    .map(
      (k) => `
    <div class="kit__card">
      ${k.badge ? `<span class="kit__badge">${k.badge}</span>` : ""}
      <h4>${k.name}</h4>
      <p>${k.description}</p>
      <span class="kit__price">${money(k.price)}</span>
      <button data-code="${k.code}" class="add-to-cart">Agregar al pedido</button>
    </div>`
    )
    .join("");
  grid.querySelectorAll(".add-to-cart").forEach((btn) =>
    btn.addEventListener("click", () => addToCart(btn.dataset.code))
  );
}

// ---------- Catalog ----------
function getFilteredProducts() {
  return state.products.filter((p) => {
    const matchesCategory =
      state.activeCategory === "todos" || p.category === state.activeCategory;
    const matchesSearch =
      !state.searchTerm ||
      p.name.toLowerCase().includes(state.searchTerm) ||
      p.description.toLowerCase().includes(state.searchTerm);
    return matchesCategory && matchesSearch;
  });
}

function renderCatalog() {
  const list = getFilteredProducts();
  const grid = document.getElementById("productGrid");

  if (list.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#565E6E">No se encontraron productos.</p>`;
    return;
  }

  grid.innerHTML = list
    .map(
      (p) => `
    <div class="product__card" data-code="${p.code}">
      <div class="product__thumb">${CATEGORY_LABELS[p.category] || p.category}</div>
      <span class="product__category">${CATEGORY_LABELS[p.category] || p.category}</span>
      <h4>${p.name}</h4>
      <span class="product__price">${money(p.price)}</span>
      <span class="product__code">Código ${p.code}</span>
      <button class="product__add" data-code="${p.code}">Agregar al pedido</button>
    </div>`
    )
    .join("");

  grid.querySelectorAll(".product__card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("product__add")) return;
      openProductModal(card.dataset.code);
    });
  });
  grid.querySelectorAll(".product__add").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.code);
    })
  );
}

// ---------- Product modal ----------
function openProductModal(code) {
  const p = state.products.find((x) => x.code === code);
  if (!p) return;
  const box = document.getElementById("productModalBox");
  box.innerHTML = `
    <button class="close" id="modalClose">&times;</button>
    <span class="product__category">${CATEGORY_LABELS[p.category] || p.category}</span>
    <h3>${p.name}</h3>
    <p>${p.description}</p>
    <div class="modal__specs">${(p.specs || []).map((s) => `<span>${s}</span>`).join("")}</div>
    <span class="modal__price">${money(p.price)}</span>
    <button class="btn btn--primary btn--block" id="modalAdd">Agregar al pedido</button>
  `;
  document.getElementById("productModal").classList.add("open");
  document.getElementById("modalClose").addEventListener("click", closeProductModal);
  document.getElementById("modalAdd").addEventListener("click", () => {
    addToCart(p.code);
    closeProductModal();
  });
}
function closeProductModal() {
  document.getElementById("productModal").classList.remove("open");
}

// ---------- Cart ----------
function saveCart() {
  localStorage.setItem("bioenergia_cart", JSON.stringify(state.cart));
}

function addToCart(code) {
  const product = state.products.find((p) => p.code === code);
  if (!product) return;
  const existing = state.cart.find((i) => i.code === code);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ code: product.code, name: product.name, price: product.price, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(code) {
  state.cart = state.cart.filter((i) => i.code !== code);
  saveCart();
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const count = state.cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById("cartCount").textContent = count;

  if (state.cart.length === 0) {
    container.innerHTML = `<p class="cart__empty">Tu carrito está vacío. Explora el catálogo y agrega productos.</p>`;
  } else {
    container.innerHTML = state.cart
      .map(
        (i) => `
      <div class="cart__item">
        <div>
          <div class="cart__item-name">${i.name}</div>
          <div class="cart__item-meta">${i.qty} x ${money(i.price)}</div>
        </div>
        <button data-code="${i.code}" class="cart__remove">Quitar</button>
      </div>`
      )
      .join("");
    container.querySelectorAll(".cart__remove").forEach((btn) =>
      btn.addEventListener("click", () => removeFromCart(btn.dataset.code))
    );
  }

  const total = state.cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  document.getElementById("cartTotal").textContent = money(total);
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

async function checkoutViaWhatsapp() {
  if (state.cart.length === 0) return;
  const customerName = document.getElementById("cartCustomerName").value.trim() || "Cliente Bioenergía";
  const total = state.cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  // Guardamos el pedido en el backend para que Nancy tenga historial
  try {
    await fetchJSON("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, items: state.cart, total })
    });
  } catch (err) {
    console.warn("No se pudo registrar el pedido en el backend:", err);
  }

  const lines = state.cart.map((i) => `- ${i.qty}x ${i.name} (${money(i.price)} c/u)`);
  const message =
    `Hola Nancy, soy ${customerName} y quiero hacer este pedido desde Bioenergía:\n\n` +
    lines.join("\n") +
    `\n\nTotal: ${money(total)}`;

  window.open(`https://wa.me/${state.distributor.whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
}

// ---------- Contact form ----------
async function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById("contactStatus");
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    await fetchJSON("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    status.textContent = "¡Mensaje enviado! Nancy te contactará pronto.";
    form.reset();
  } catch (err) {
    status.textContent = "No se pudo enviar el mensaje. Intenta de nuevo.";
  }
}

// ---------- Events ----------
function bindEvents() {
  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
  document.getElementById("cartCheckout").addEventListener("click", checkoutViaWhatsapp);
  document.getElementById("contactForm").addEventListener("submit", handleContactSubmit);
  document.getElementById("productModal").addEventListener("click", (e) => {
    if (e.target.id === "productModal") closeProductModal();
  });
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.searchTerm = e.target.value.toLowerCase();
    renderCatalog();
  });
}

init();
