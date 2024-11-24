let dailyDeals = [];
let featuredProducts = []; 

async function getDailyDealsProducts() {
  try {
    const result = await executeProcedure('sp_get_all_products_with_discount', {});
    console.log('Daily Deals result:', result.data[0]);
    return result.data[0];
  } catch (error) {
    console.error('Error getting daily deals products:', error.message);
    return [];
  }
}

async function getFeaturedProducts() {
  try {
    const result = await executeProcedure('sp_get_featured_products', {});
    console.log('Featured Products result:', result.data[0]);
    return result.data[0];
  } catch (error) {
    console.error('Error getting featured products:', error.message);
    return [];
  }
}

function renderProducts(list, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; 

  list.forEach((item) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product-card";

    const discountedPrice = item.BasePrice * (1 - item.DiscountPercentage / 100);

    productDiv.innerHTML = `
      <img 
        src="${item.ImgURL || 'default-image.jpg'}" 
        alt="${item.ProductName}" 
        style="max-height: 150px; object-fit: contain; margin-bottom: 10px;"
      >
      <div class="product-name">${item.ProductName}</div>
      <div class="product-price">
        ${item.DiscountPercentage > 0 
          ? `<span class="original-price">$${item.BasePrice.toFixed(2)}</span> 
             <span class="discounted-price">$${discountedPrice.toFixed(2)}</span>`
          : `$${item.BasePrice.toFixed(2)}`}
      </div>
      <div class="discount-percentage">${item.DiscountPercentage}% OFF</div>
    `;

    productDiv.addEventListener('click', () => {
      window.location.href = `../GUI/ProductDetail.html?productId=${item.ProductID}`;
    });

    container.appendChild(productDiv);
  });
}

async function initializeProducts() {
  try {
    // Obtener y renderizar Daily Deals.
    dailyDeals = await getDailyDealsProducts();
    renderProducts(dailyDeals, "daily-deals");

    // Obtener y renderizar Featured Products.
    featuredProducts = await getFeaturedProducts();
    renderProducts(featuredProducts, "featured-products");
  } catch (error) {
    console.error('Error initializing products:', error.message);
  }
}

document.addEventListener("DOMContentLoaded", initializeProducts);

function scrollProducts(containerId, direction) {
  const container = document.getElementById(containerId);
  const scrollAmount = 130;
  container.scrollLeft += direction * scrollAmount;
}

function handleSearch() {
  const searchInput = document.getElementById("searchInput").value.trim();
  if (searchInput) {
    sessionStorage.setItem("searchQuery", searchInput);
    window.location.href = "../GUI/Products.html";
  } else {
    alert("Please enter a search term!");
  }
}
