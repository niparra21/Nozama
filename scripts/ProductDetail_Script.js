function handleSearch() {
    const searchInput = document.getElementById("searchInput").value.trim();
    if (searchInput) {
      sessionStorage.setItem("searchQuery", searchInput); 
      window.location.href = "../GUI/Products.html"; 
    } else {
      alert("Please enter a search term!");
    }
  }

async function loadProductDetails() {
    const product = await getProductById();
    if (product) {
        document.getElementById('productName').textContent = product.ProductName;

        // Mostrar precios con descuento si aplica
        if (product.DiscountPercentage > 0) {
            const originalPrice = product.BasePrice.toFixed(2);
            const discountedPrice = (product.BasePrice * (1 - product.DiscountPercentage / 100)).toFixed(2);
            const discountPercentage = product.DiscountPercentage;

            document.getElementById('originalPrice').textContent = `$${originalPrice}`;
            document.getElementById('originalPrice').style.textDecoration = 'line-through';
            document.getElementById('discountedPrice').textContent = `$${discountedPrice}`;
            document.getElementById('discountPercentage').textContent = `${discountPercentage}% OFF`;
        } else {
            document.getElementById('discountedPrice').textContent = `$${product.BasePrice.toFixed(2)}`;
            document.getElementById('originalPrice').textContent = '';
            document.getElementById('discountPercentage').textContent = '';
        }

        document.getElementById('productImage').src = product.ImgURL || 'default-image.jpg';
        document.getElementById('stockAvailability').textContent = `In Stock: ${product.Stock}`;
        document.getElementById('productCategory').textContent = `Category: ${product.Category}`;
        document.getElementById('productBrand').textContent = `Brand: ${product.Brand}`;
        document.getElementById('productDescription').textContent = product.Description;
        
        if (product.Stock <= 0) {
            document.getElementById('buttonAddToCart').disabled = true;
            document.getElementById('buttonAddToCart').textContent = 'Out of Stock';
        }
        const specificationsText = document.getElementById('specificationsText');
        specificationsText.textContent = product.Specification || 'No specifications available.';

        const stars = document.getElementById('productStars');
        stars.innerHTML = '';
        for (let i = 0; i < Math.floor(product.AverageRating); i++) {
            stars.innerHTML += '★';
        }
        for (let i = Math.floor(product.AverageRating); i < 5; i++) {
            stars.innerHTML += '☆';
        }

        await loadProductReviews();

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

async function getProductReviews() {
    const productId = await getProductIdFromURL();
    const params = { ProductID: parseInt(productId) };
    try {
        const response = await executeProcedure('sp_get_product_reviews', params);
        const reviews = response.data;
        return reviews[0];
    } catch (error) {
        console.log('Error at fetching product reviews:', error);
        return null;
    }
}

async function loadProductReviews() {
    const reviews = await getProductReviews(); 
    const reviewsContainer = document.getElementById('reviewsContainer');
    
    reviewsContainer.innerHTML = ''; 

    console.log(reviews);
    
    if (reviews && reviews.length > 0) {
        reviews.forEach((review) => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review';

            
            const userElement = document.createElement('div');
            userElement.className = 'review-user';
            userElement.textContent = review.FirstName || 'Anonymous';

            const stars = '★'.repeat(review.Rating) + '☆'.repeat(5 - review.Rating);
            const starsElement = document.createElement('div');
            starsElement.className = 'review-stars';
            starsElement.textContent = stars;

            const commentElement = document.createElement('div');
            commentElement.className = 'review-comment';
            commentElement.textContent = review.Review || 'No comment provided.';

            reviewElement.appendChild(userElement);
            reviewElement.appendChild(starsElement);
            reviewElement.appendChild(commentElement);
            reviewsContainer.appendChild(reviewElement);
        });
    } else {
        reviewsContainer.innerHTML = '<p>No reviews available for this product.</p>';
    }
}

async function addToCartQuery() {
    const productId = await getProductIdFromURL();
    const UserID = sessionStorage.getItem('UserID');

    const params = { UserID: UserID, ProductID: productId };
    try {
        const result = await executeProcedure('sp_add_to_cart', params);

        if (result) {
            alert('Product added to cart successfully!');
        } else {
            alert('Failed to add product to cart.');
        }

    } catch (error) {
        console.error(error);
    }
}

function addEventListeners() {
    document.getElementById('buttonAddToCart').addEventListener('click', addToCartQuery);
}

document.addEventListener('DOMContentLoaded', () => {
    addEventListeners();
    loadProductDetails();
});
