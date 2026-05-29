# FoodDash — Smart Restaurant Dashboard

A responsive, single-page restaurant management dashboard built with vanilla HTML, CSS, and JavaScript (ES Modules). It connects to the [DummyJSON](https://dummyjson.com) public API to load product data and persists cart/customer data in the browser's `localStorage`.

---

## Features

- **Dashboard** — Stats overview (revenue, orders, customers, products) and featured products
- **Products** — Browse and search items fetched from DummyJSON API
- **Cart** — Add, increase, decrease, or remove items; total updates in real time
- **Orders** — View all pending cart orders with subtotals
- **Customers** — View, search, add, and delete customers (data persisted in localStorage)
- **Settings** — Restaurant info, notification toggles, appearance (dark mode, language, currency), and password management
- **Dark Mode** — Toggle via navbar or Settings page; preference saved across sessions
- **Debounced Search** — Filters products and customers efficiently without hammering re-renders

---

## Project Structure

```
project-root/
│
├── index.html              # Main HTML entry point
│
├── css/
│   ├── style.css           # Core styles
│   └── responsive.css      # Mobile / tablet breakpoints
│
└── js/
    ├── main.js             # App entry — navigation, cart, search, dark mode
    └── modules/
        ├── api.js          # Fetches products from DummyJSON API
        ├── cart.js         # Cart state + localStorage persistence
        ├── modal.js        # Product detail modal
        ├── ui.js           # Renders product cards into the DOM
        └── utils.js        # Debounce helper + toast notifications
```

> Make sure your folder structure matches the import paths in `main.js`. CSS files go in `css/`, JS modules go in `js/modules/`.

---

## Prerequisites

- A modern browser with ES Module support (Chrome 61+, Firefox 60+, Edge 16+, Safari 10.1+)
- A static file server — **you cannot open `index.html` directly via `file://`** because ES Modules are blocked by browsers under that protocol

---

## Running Locally

### Option 1 — VS Code Live Server (recommended)

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code
2. Right-click `index.html` → **Open with Live Server**
3. The app opens at `http://127.0.0.1:5500`

### Option 2 — Node.js `serve`

```bash
npx serve .
```

Then open the printed URL (usually `http://localhost:3000`).

### Option 3 — Python built-in server

```bash
# Python 3
python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

---

## Deploying to Production

### Netlify (drag & drop)

1. Go to [app.netlify.com](https://app.netlify.com) and log in
2. Drag the entire project folder onto the Netlify dashboard
3. Your site is live instantly at a `*.netlify.app` URL

### Netlify CLI

```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

### GitHub Pages

1. Push the project to a GitHub repository
2. Go to **Settings → Pages**
3. Set Source to `main` branch, root folder `/`
4. Your site will be published at `https://<username>.github.io/<repo-name>/`

### Vercel

```bash
npm install -g vercel
vercel --prod
```

No build config needed — Vercel detects a static site automatically.

---

## External Dependencies

All loaded via CDN — no `npm install` required.

| Dependency | Version | Purpose |
|---|---|---|
| Google Fonts (Poppins) | — | Typography |
| Font Awesome | 6.5.2 | Icons throughout the UI |
| DummyJSON API | — | Product data (`https://dummyjson.com/products`) |

---

## Browser Storage

The app uses `localStorage` for:

- `cart` — persists cart items between page reloads
- `customers` — persists customer list (add/delete operations)
- `theme` — remembers dark/light mode preference

No backend or database is required.

---

## Notes

- The Settings page (restaurant info, password fields) is UI-only — changes are not persisted because there is no backend.
- The "Checkout" and "Place Order" buttons show a toast confirmation but do not process real payments.
- To reset all data, clear `localStorage` in your browser's DevTools (`Application → Local Storage → Clear All`).
# Smart-Restaurant-Dashboard
