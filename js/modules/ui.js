export function displayProducts(products, container) {
  let html = "";

  products.forEach((p) => {
    html += `
      <div class="product-card" data-id="${p.id}">

        <img src="${p.thumbnail}" alt="${p.title}" />

        <h3>${p.title}</h3>

        <p class="price">$${p.price}</p>

        <button class="add-btn" data-id="${p.id}">
          Add To Cart
        </button>

      </div>
    `;
  });

  container.innerHTML = html;
}