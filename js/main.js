import { getProducts } from "./modules/api.js";
import { displayProducts } from "./modules/ui.js";
import { cart, saveCart } from "./modules/cart.js";
import { debounce, showToast } from "./modules/utils.js";

/* ================= DOM ================= */

const productsContainer = document.getElementById("productsContainer");
const cartCount = document.getElementById("cartCount");
const searchInput = document.getElementById("searchInput");

const cartSidebar = document.getElementById("cartSidebar");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");

const themeToggle = document.getElementById("themeToggle");
const pageTitle = document.getElementById("pageTitle");

/* ================= STATE ================= */

let allProducts = [];
let productsLoaded = false;

/* ================= CUSTOMERS STATE ================= */
// ✅ FIXED: Moved here BEFORE init() so they're initialized when initCustomers() runs

const AVATAR_COLORS = [
  "#6366f1", "#ec4899", "#f97316", "#14b8a6",
  "#8b5cf6", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b"
];

let customers = JSON.parse(localStorage.getItem("customers")) || [
  { id: 1, name: "Ahmed Mohamed", email: "ahmed.m@email.com", phone: "+20 100 123 4567", orders: 14, spent: 340.00, status: "Active", color: "#6366f1" },
  { id: 2, name: "Sara Ali", email: "sara.ali@email.com", phone: "+20 101 987 6543", orders: 8, spent: 215.50, status: "Active", color: "#ec4899" },
  { id: 3, name: "Mohamed Kamal", email: "m.kamal@email.com", phone: "+20 112 456 7890", orders: 22, spent: 580.75, status: "Active", color: "#f97316" },
  { id: 4, name: "Nour Rashad", email: "nour.r@email.com", phone: "+20 155 321 0987", orders: 5, spent: 128.00, status: "Inactive", color: "#14b8a6" },
  { id: 5, name: "Yasmin Hassan", email: "yasmin.h@email.com", phone: "+20 120 654 3210", orders: 31, spent: 920.20, status: "Active", color: "#8b5cf6" },
  { id: 6, name: "Omar Badr", email: "omar.b@email.com", phone: "+20 111 222 3344", orders: 2, spent: 45.00, status: "Inactive", color: "#ef4444" },
];

function saveCustomers() {
  localStorage.setItem("customers", JSON.stringify(customers));
}

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function renderCustomers(list) {
  const tbody = document.getElementById("customersTableBody");
  const noMsg = document.getElementById("noCustomersMsg");
  if (!tbody) return;

  // Update stats
  const top = [...customers].sort((a, b) => b.spent - a.spent)[0];
  document.getElementById("statTotal").textContent = customers.length;
  document.getElementById("statActive").textContent = customers.filter(c => c.status === "Active").length;
  document.getElementById("statInactive").textContent = customers.filter(c => c.status === "Inactive").length;
  if (top) {
    document.getElementById("topSpenderName").textContent = top.name;
    document.getElementById("topSpenderAmount").textContent = `$${top.spent.toFixed(2)}`;
    document.getElementById("topSpenderAvatar").textContent = getInitials(top.name);
    document.getElementById("topSpenderAvatar").style.background = top.color;
  }

  if (list.length === 0) {
    tbody.innerHTML = "";
    noMsg.style.display = "block";
    return;
  }
  noMsg.style.display = "none";

  tbody.innerHTML = list.map(c => {
    const isTop = top && c.id === top.id;
    return `
    <tr class="${isTop ? "top-spender-row" : ""}">
      <td >
        <div class="cust-name" >
          <div class="cust-avatar" style="background:${c.color}">${getInitials(c.name)}</div>
          ${c.name}
          ${isTop ? `<span class="crown-badge"><i class="fa-solid fa-crown"></i></span>` : ""}
        </div>
      </td>
      <td>${c.email}</td>
      <td>${c.phone || "—"}</td>
      <td><span class="orders-count-badge">${c.orders}</span></td>
      <td><strong>$${c.spent.toFixed(2)}</strong></td>
      <td><span class="${c.status === "Active" ? "badge-active" : "badge-inactive"}">${c.status}</span></td>
      <td>
        <button class="del-cust-btn" data-id="${c.id}" title="Delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>`;
  }).join("");

  // Delete buttons
  tbody.querySelectorAll(".del-cust-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      customers = customers.filter(c => c.id !== id);
      saveCustomers();
      renderCustomers(customers);
      showToast("Customer removed");
    });
  });
}

function initCustomers() {
  renderCustomers(customers);

  // Search
  const searchInput = document.getElementById("customerSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", debounce((e) => {
      const q = e.target.value.toLowerCase();
      const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
      );
      renderCustomers(filtered);
    }, 250));
  }

  // Open modal
  document.getElementById("openAddCustomerModal")?.addEventListener("click", () => {
    document.getElementById("addCustomerModal").classList.add("active");
    document.getElementById("modalError").textContent = "";
    ["newCustName", "newCustEmail", "newCustPhone", "newCustOrders", "newCustSpent"].forEach(id => {
      document.getElementById(id).value = "";
    });
    document.getElementById("newCustStatus").value = "Active";
  });

  // Close modal
  ["closeAddCustomerModal", "cancelAddCustomer"].forEach(id => {
    document.getElementById(id)?.addEventListener("click", () => {
      document.getElementById("addCustomerModal").classList.remove("active");
    });
  });

  // Click outside modal to close
  document.getElementById("addCustomerModal")?.addEventListener("click", (e) => {
    if (e.target.id === "addCustomerModal") {
      document.getElementById("addCustomerModal").classList.remove("active");
    }
  });

  // Save new customer
  document.getElementById("saveNewCustomer")?.addEventListener("click", () => {
    const name = document.getElementById("newCustName").value.trim();
    const email = document.getElementById("newCustEmail").value.trim();
    const phone = document.getElementById("newCustPhone").value.trim();
    const orders = parseInt(document.getElementById("newCustOrders").value) || 0;
    const spent = parseFloat(document.getElementById("newCustSpent").value) || 0;
    const status = document.getElementById("newCustStatus").value;
    const errEl = document.getElementById("modalError");

    if (!name) { errEl.textContent = "Name is required."; return; }
    if (!email || !email.includes("@")) { errEl.textContent = "Valid email is required."; return; }

    errEl.textContent = "";
    const color = AVATAR_COLORS[customers.length % AVATAR_COLORS.length];
    customers.push({ id: Date.now(), name, email, phone, orders, spent, status, color });
    saveCustomers();
    renderCustomers(customers);
    document.getElementById("addCustomerModal").classList.remove("active");
    showToast("Customer added!");
  });
}

/* ================= INIT ================= */
// ✅ Now safe to call — customers is fully initialized above

init();

async function init() {
  setupNavigation();
  updateCartUI();
  initCustomers();
}

/* ================= DASHBOARD FEATURED PRODUCTS ================= */

async function loadDashboardProducts() {
  const grid = document.getElementById("dashProductsGrid");
  if (!grid) return;

  try {
    let products = allProducts;
    if (!products.length) {
      const res = await fetch("https://dummyjson.com/products?limit=6");
      const data = await res.json();
      products = data.products;
    } else {
      products = products.slice(0, 6);
    }

    grid.innerHTML = products.slice(0, 6).map(p => `
      <div class="dash-product-card">
        <div class="dash-product-img-wrap">
          <img src="${p.thumbnail}" alt="${p.title}" />
          <span class="dash-product-category">${p.category}</span>
        </div>
        <div class="dash-product-info">
          <h4>${p.title}</h4>
          <div class="dash-product-bottom">
            <span class="dash-product-price">$${p.price}</span>
            <div class="dash-product-rating">
              <i class="fa-solid fa-star"></i>
              ${p.rating}
            </div>
          </div>
        </div>
      </div>
    `).join("");
  } catch {
    grid.innerHTML = `<p class="muted-text">Could not load products.</p>`;
  }
}

// "View All" link on dashboard navigates to products page
document.getElementById("viewAllProducts")?.addEventListener("click", (e) => {
  e.preventDefault();
  navigateTo("products");
});

/* ================= PAGE NAVIGATION ================= */

function setupNavigation() {
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
}

async function navigateTo(page) {
  // Update active menu item
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === page);
  });

  // Update active page section
  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.toggle("active", section.id === `page-${page}`);
  });

  // Update navbar title
  const titles = {
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    settings: "Settings",
  };
  pageTitle.textContent = titles[page] || page;

  // Show/hide search bar only on products page
  searchInput.style.display = page === "products" ? "block" : "none";

  // Lazy load products when visiting products page
  if (page === "products" && !productsLoaded) {
    productsLoaded = true;
    const products = await getProducts();
    allProducts = products;
    displayProducts(allProducts, productsContainer);
  }

  // Load featured products on dashboard
  if (page === "dashboard") {
    loadDashboardProducts();
  }

  // Render cart orders dynamically
  if (page === "orders") {
    renderOrdersPage();
  }

  // Sync settings dark mode toggle
  if (page === "settings") {
    const toggle = document.getElementById("settingsDarkToggle");
    if (toggle) {
      toggle.checked = document.body.classList.contains("dark");
      toggle.addEventListener("change", () => {
        const isDark = toggle.checked;
        document.body.classList.toggle("dark", isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
        themeToggle.querySelector("i").className = isDark
          ? "fa-solid fa-sun"
          : "fa-solid fa-moon";
      });
    }
  }
}

// Start on dashboard
navigateTo("dashboard");

/* ================= ORDERS PAGE ================= */

function renderOrdersPage() {
  const container = document.getElementById("ordersTableContainer");
  const badge = document.getElementById("ordersBadge");
  const pendingCount = document.getElementById("orderCountPending");
  const ordersCartTotal = document.getElementById("ordersCartTotal");

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  badge.textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`;
  if (pendingCount) pendingCount.textContent = cart.length;
  if (ordersCartTotal) ordersCartTotal.textContent = `$${totalPrice.toFixed(2)}`;

  // Wire place order button
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  if (placeOrderBtn) {
    placeOrderBtn.onclick = () => {
      if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
      }
      showToast("🎉 Order placed successfully!");
    };
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="orders-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>No items in cart yet. Go to <strong>Products</strong> and add some!</p>
      </div>
    `;
    return;
  }

  let rows = "";
  cart.forEach((item) => {
    rows += `
      <tr>
        <td>
          <div class="orders-item-cell">
            <img src="${item.thumbnail}" alt="${item.title}" />
            <span>${item.title}</span>
          </div>
        </td>
        <td>$${item.price.toFixed(2)}</td>
        <td>${item.quantity}</td>
        <td><strong>$${(item.price * item.quantity).toFixed(2)}</strong></td>
        <td><span class="order-status-pending">Pending</span></td>
      </tr>
    `;
  });

  container.innerHTML = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Unit Price</th>
          <th>Qty</th>
          <th>Subtotal</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ================= CART ================= */

function updateCartUI() {
  cartCount.textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-cart">Cart is empty</p>`;
    cartTotal.textContent = 0;
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;

    cartItems.innerHTML += `
      <div class="cart-item">

        <img src="${item.thumbnail}" width="50" />

        <div class="cart-item-info">
          <h4>${item.title}</h4>
          <p>$${item.price}</p>

          <div class="quantity-controls">
            <button onclick="dec(${item.id})">-</button>
            ${item.quantity}
            <button onclick="inc(${item.id})">+</button>
          </div>
        </div>

        <button class="remove-btn" onclick="removeItem(${item.id})">X</button>

      </div>
    `;
  });

  cartTotal.textContent = total.toFixed(2);
}

/* ================= CART ACTIONS ================= */

window.inc = (id) => {
  const item = cart.find((i) => i.id === id);
  item.quantity++;

  saveCart();
  updateCartUI();
};

window.dec = (id) => {
  const item = cart.find((i) => i.id === id);

  if (item.quantity > 1) item.quantity--;
  else cart.splice(cart.indexOf(item), 1);

  saveCart();
  updateCartUI();
};

window.removeItem = (id) => {
  const index = cart.findIndex((i) => i.id === id);

  cart.splice(index, 1);

  saveCart();
  updateCartUI();
};

/* ================= ADD TO CART ================= */

productsContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("add-btn")) return;

  const id = Number(e.target.dataset.id);

  const product = allProducts.find((p) => p.id === id);
  const existing = cart.find((i) => i.id === id);

  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });

  saveCart();
  updateCartUI();

  showToast("Added to cart");
});

/* ================= SEARCH (DEBOUNCED) ================= */

searchInput.addEventListener(
  "input",
  debounce((e) => {
    const value = e.target.value.toLowerCase();

    const filtered = allProducts.filter((p) =>
      p.title.toLowerCase().includes(value)
    );

    displayProducts(filtered, productsContainer);
  }, 300)
);

/* ================= CART SIDEBAR ================= */

openCart.addEventListener("click", () => {
  cartSidebar.classList.add("active");
  renderCart();
});

closeCart.addEventListener("click", () => {
  cartSidebar.classList.remove("active");
});

/* ================= DARK MODE ================= */

// Load saved theme on startup
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.querySelector("i").className = "fa-solid fa-sun";
}

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.querySelector("i").className = isDark
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
});