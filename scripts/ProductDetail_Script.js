async function loadProductDetails() {
    const product = await getProductById();
    if (product) {
        document.getElementById('productName').textContent = product.ProductName;

        // Condición para aplicar descuento y mostrar precios
        if (product.DiscountPercentage > 0) {
            const originalPrice = product.BasePrice.toFixed(2);
            const discountedPrice = (product.BasePrice * (1 - product.DiscountPercentage / 100)).toFixed(2);
            const discountPercentage = product.DiscountPercentage;

            document.getElementById('originalPrice').textContent = `$${originalPrice}`;
            document.getElementById('discountedPrice').textContent = `$${discountedPrice}`;
            document.getElementById('discountPercentage').textContent = `${discountPercentage}% OFF`;
        } else {
            document.getElementById('discountedPrice').textContent = `$${product.BasePrice.toFixed(2)}`;
            document.getElementById('originalPrice').textContent = '';      // No mostrar precio original si no hay descuento
            document.getElementById('discountPercentage').textContent = ''; // No mostrar porcentaje de descuento si no hay
        }

        document.getElementById('productImage').src = product.ImgURL || 'default-image.jpg';
        
        document.getElementById('stockAvailability').textContent = `In Stock: ${product.Stock}`;
        document.getElementById('productCategory').textContent = `Category: ${product.Category}`;
        document.getElementById('productBrand').textContent = `Brand: ${product.Brand}`;
        
        const stars = document.getElementById('productStars');
        for (let i = 0; i < Math.floor(product.AverageRating); i++) {
            stars.innerHTML += '★';
        }
        for (let i = Math.floor(product.AverageRating); i < 5; i++) {
            stars.innerHTML += '☆';
        }
        
        document.getElementById('productDescription').textContent = product.Description;
    } else {
        console.log('Product not found');
    }
}



async function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('productId');
}

async function getProductById() {
    const productId = await getProductIdFromURL();
    const params = { ProductID: parseInt(productId) };

    try {
        const response = await executeProcedure('sp_get_product_by_id', params);
        const product = response.data[0];
        console.log(product[0]);
        return product[0];
    } catch (error) {
        console.log('Error at fetching product:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});
