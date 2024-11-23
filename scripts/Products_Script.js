// Obtiene todos los productos desde la base de datos
async function getAllProducts() {
    try {
        const result = await executeProcedure('sp_get_all_products_for_products_menu', {});
        console.log('Stored procedure result: ', result.data[0]);
        return result.data[0]; 
    } catch (error) {
        console.error('Error getting all products:', error.message);
        return [];
    }
}

async function getAllCategories() {
    try {
        const result = await executeProcedure('sp_get_all_categories', {});
        console.log('Stored procedure result: ', result.data[0]);
        return result.data[0]; 
    } catch (error) {
        console.error('Error getting all categories:', error.message);
        return [];
    }
}

async function getAllBrand() {
    try {
        const result = await executeProcedure('sp_get_all_brands');
        console.log('Stored procedure result: ', result.data[0]);
        return result.data[0];
    } catch {
        console.error('Error getting all brands:', error.message);
        return [];
    }
}

// Renderiza los productos en la cuadrícula
function renderProducts(filteredProducts) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = ''; 

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const originalPrice = product.BasePrice;
        const discountedPrice = originalPrice * (1 - product.DiscountPercentage / 100);

        card.innerHTML = `
            <img src="${product.ImgURL || 'default-image.jpg'}" alt="${product.ProductName}">
            <div class="product-name">${product.ProductName}</div>
            <div class="product-price">
                ${product.DiscountPercentage > 0 
                    ? `<span class="original-price">$${originalPrice.toFixed(2)}</span> 
                       <span class="discounted-price">$${discountedPrice.toFixed(2)}</span>`
                    : `$${originalPrice.toFixed(2)}`}
            </div>
            <div class="product-rating">${'★'.repeat(Math.floor(product.AverageRating || 0))}</div>
        `;

        card.addEventListener('click', () => {
            window.location.href = `../GUI/ProductDetail.html?productId=${product.ProductID}`;
        });

        grid.appendChild(card);
    });
}


async function fetchAndRenderCategories() {
    try {
        const categories = await getAllCategories();
        const categoryFilter = document.getElementById('categoryFilter');

        categoryFilter.innerHTML = '<option value="all">All</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.CategoryID; 
            option.textContent = category.Name;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching categories:', error.message);
    }
}

async function fetchAndRenderBrands() {
    try {
        const brands = await getAllBrand();
        const brandFilter = document.getElementById('brandFilter');

        brandFilter.innerHTML = '<option value="all">All</option>';

        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.BrandID;
            option.textContent = brand.Name;
            brandFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching brands:', error.message);
    }
}

// Aplica los filtros seleccionados
function applyFilters() {
    const priceFilter = document.getElementById('priceFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const brandFilter = document.getElementById('brandFilter').value;

    let filteredProducts = [...products]; 

    // Filtro por precio
    if (priceFilter === 'low') {
        filteredProducts.sort((a, b) => a.BasePrice - b.BasePrice);
    } else if (priceFilter === 'high') {
        filteredProducts.sort((a, b) => b.BasePrice - a.BasePrice);
    }

    // Filtro por categoría
    if (categoryFilter !== 'all') {
        console.log(categoryFilter);
        filteredProducts = filteredProducts.filter(product => product.CategoryID === parseInt(categoryFilter));
    }

    // Filtro por marca
    if (brandFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.BrandID === parseInt(brandFilter));
    }

    renderProducts(filteredProducts); 
}

function searchProducts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    // Filtrar productos por el nombre
    const filteredProducts = products.filter(product =>
        product.ProductName.toLowerCase().includes(searchInput)
    );

    renderProducts(filteredProducts);
}

function addEventListeners() {
    document.getElementById('searchButton').addEventListener('click', searchProducts);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('brandFilter').addEventListener('change', applyFilters);
}

function loadSearchQuery() {
    const searchQuery = sessionStorage.getItem("searchQuery") || "";
    if (searchQuery) {
        document.getElementById("searchInput").value = searchQuery; 
        searchProducts(); 
        localStorage.removeItem("searchQuery");
    }
}

async function initializePage() {
    try {
        await fetchAndRenderCategories();
        await fetchAndRenderBrands();

        products = await getAllProducts();
        renderProducts(products);
        loadSearchQuery();
    } catch (error) {
        console.error('Error initializing page:', error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    addEventListeners();
    initializePage();
});

// Variable global para almacenar los productos cargados
let products = [];
