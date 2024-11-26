let dailyDeals = [];
let featuredProducts = []; 
let categories = {};

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

async function getTopCategories() {
  try {
    const result = await executeProcedure('sp_get_top_categories', {});
    console.log('Top Categories result:', result.data[0]);
    const categoryDict = result.data[0].reduce((dict, category) => {
      dict[category.CategoryID] = category.CategoryName;
      return dict;
    }, {});
    return categoryDict;
  } catch (error) {
    console.error('Error getting top categories:', error.message);
    return {};
  }
}


function renderCategories(categoryDict) {
  const nav = document.querySelector('nav');
  nav.innerHTML = ''; 

  Object.entries(categoryDict).forEach(([categoryId, categoryName]) => {
    const categoryLink = document.createElement('a');
    categoryLink.href = "../GUI/Products.html"; 
    categoryLink.textContent = categoryName;

    categoryLink.addEventListener('click', (e) => {
      e.preventDefault(); 
      sessionStorage.setItem("selectedCategoryId", categoryId); 
      sessionStorage.setItem("selectedCategoryName", categoryName); 
      window.location.href = categoryLink.href;
    });

    nav.appendChild(categoryLink);
  });
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

async function initializePage() {
  try {
    categories = await getTopCategories();
    console.log('Categories dictionary:', categories);
    renderCategories(categories);
    console.log('Rendered categories in nav:', document.querySelector('nav').innerHTML);
    dailyDeals = await getDailyDealsProducts();
    renderProducts(dailyDeals, "daily-deals");
    featuredProducts = await getFeaturedProducts();
    renderProducts(featuredProducts, "featured-products");
  } catch (error) {
    console.error('Error initializing page:', error.message);
  }
}
document.addEventListener("DOMContentLoaded", initializePage);

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
