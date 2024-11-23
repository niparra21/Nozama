const dailyDeals = ["Oferta 1", "Oferta 2", "Oferta 3", "Oferta 4", "Oferta 5", "Oferta 6", "Oferta 7", "Oferta 8"];
const featuredProducts = ["Producto 1", "Producto 2", "Producto 3", "Producto 4", "Producto 5", "Producto 6"];

function renderProducts(list, containerId) {
  const container = document.getElementById(containerId);
  list.forEach((item) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.textContent = item;
    container.appendChild(productDiv);
  });
}

renderProducts(dailyDeals, "daily-deals");
renderProducts(featuredProducts, "featured-products");

function scrollProducts(containerId, direction) {
  const container = document.getElementById(containerId);
  const scrollAmount = 130;
  container.scrollLeft += direction * scrollAmount;
}

function handleSearch() {
    const searchInput = document.getElementById("searchInput").value.trim();
    if (searchInput) {
      localStorage.setItem("searchQuery", searchInput); 
      window.location.href = "../GUI/Products.html"; 
    } else {
      alert("Please enter a search term!");
    }
  }