export function openModal(product) {
  const modal = document.getElementById("modal");

  modal.innerHTML = `
    <div class="modal-content">
      <img src="${product.thumbnail}" />
      <h2>${product.title}</h2>
      <p>${product.description}</p>
      <button id="closeModal">Close</button>
    </div>
  `;

  modal.classList.add("active");

  document
    .getElementById("closeModal")
    .addEventListener("click", () => {
      modal.classList.remove("active");
    });
}