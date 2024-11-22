// Obtiene todos los productos desde la base de datos
async function getAllProducts() {
    try {
        const result = await executeProcedure('sp_get_all_products_for_products_menu', {});
        console.log('Stored procedure result: ', result.data);
        return result.data[0]; // Asegúrate de que result.data contiene los productos
    } catch (error) {
        console.error('Error getting all products:', error.message);
        return [];
    }
}

async function getAllCategories() {
    try {
        const result = await executeProcedure('sp_get_all_categories', {});
    }
}

// Renderiza los productos en la cuadrícula
function renderProducts(filteredProducts) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = ''; // Limpia la cuadrícula existente

    // Itera sobre los productos y crea las tarjetas de productos
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Estructura HTML para cada tarjeta de producto
        card.innerHTML = `
            <img src="${product.ImgURL || 'default-image.jpg'}" alt="${product.ProductName}">
            <div class="product-name">${product.ProductName}</div>
            <div class="product-price">$${product.BasePrice}</div>
            <div class="product-rating">${'★'.repeat(Math.floor(product.AverageRating || 0))}</div>
        `;
        grid.appendChild(card);
    });
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
        filteredProducts = filteredProducts.filter(product => product.Category === categoryFilter);
    }

    // Filtro por marca
    if (brandFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.Brand === brandFilter);
    }

    renderProducts(filteredProducts); // Renderizar los productos filtrados
}

// Filtra productos según el texto ingresado
function searchProducts() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    // Filtrar productos por el nombre
    const filteredProducts = products.filter(product =>
        product.ProductName.toLowerCase().includes(searchInput)
    );

    renderProducts(filteredProducts);
}

// Asigna eventos a los elementos dinámicamente
function addEventListeners() {
    document.getElementById('searchButton').addEventListener('click', searchProducts);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('brandFilter').addEventListener('change', applyFilters);
}

// Carga los productos al cargar la página
async function fetchAndRenderProducts() {
    try {
        products = await getAllProducts();
        console.log(products[0]); // Verifica que los productos se cargaron correctamente
        renderProducts(products);
    } catch (error) {
        console.error('Error al cargar los productos:', error.message);
    }
}

// Inicializa la aplicación
document.addEventListener('DOMContentLoaded', () => {
    addEventListeners();
    fetchAndRenderProducts();
});

// Variable global para almacenar los productos cargados
let products = [];
