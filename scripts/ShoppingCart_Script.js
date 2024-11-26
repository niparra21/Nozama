
  async function getCartByUserId() {
    const userId = sessionStorage.getItem('UserID');
    const params = {UserID: userId};

    try {
      const result = await executeProcedure('sp_get_shopping_carts_by_user', params);
      console.log(result.data[0]);
      return result.data[0];
    } catch (error) {
      console.error(error);
    }
  }

  async function renderCart() {
    const cartItems = await getCartByUserId();
    const cartItemsContainer = document.getElementById('cartItems');
    const totalPriceContainer = document.getElementById('totalPrice');
    cartItemsContainer.innerHTML = '';
  
    let totalPrice = 0;
  
    cartItems.forEach((item, index) => {
      const basePrice = item.BasePrice || 0;
      const discount = item.DiscountPercentage || 0;
      const amount = item.Amount || 1;
    
      const itemPrice = basePrice * (1 - discount / 100);
      totalPrice += itemPrice * amount;
      
      const disableIncrease = amount >= item.Stock ? 'disabled' : ''

      const cartItemDiv = document.createElement('div');
      cartItemDiv.className = 'cart-item';
      cartItemDiv.innerHTML = `
        <div class="cart-item-details">
          <img src="${item.ImgURL}" class="cart-item-image">
          <div class="cart-item-name">${item.ProductName || "Unnamed Product"}</div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button onclick="reduceQuantity(${item.ProductID})">-</button>
            <span>${amount}</span>
            <button onclick="increaseQuantity(${item.ProductID})"${disableIncrease}>+</button>
          </div>
          <button class="remove-button" onclick="removeItem(${item.ProductID})">Remove</button>
        </div>
        <div class="cart-item-price">$${(itemPrice * amount).toFixed(2)}</div>
      `;
      cartItemsContainer.appendChild(cartItemDiv);
    });
     
  
    totalPriceContainer.textContent = `$${totalPrice.toFixed(2)}`;
  }
  
  async function reduceQuantity(ProductID) {
    const userId = sessionStorage.getItem('UserID');
    
    const params = {
      UserID: userId,
      ProductID: ProductID,
    };
  
    try {
      await executeProcedure('sp_subtract_from_cart', params);
      await renderCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  }

  async function increaseQuantity(ProductID) {
    const userId = sessionStorage.getItem('UserID');
    
    const params = {
      UserID: userId,
      ProductID: ProductID,
    };
  
    try {
      await executeProcedure('sp_add_to_cart', params);
      await renderCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity. Please try again.");
    }
  }
  
  
  async function removeItem(ProductID) {
    const userId = sessionStorage.getItem('UserID');
    
    const params = {
      UserID: userId,
      ProductID: ProductID,
    };
  
    try {
      await executeProcedure('sp_remove_from_cart', params);
      await renderCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    }
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

  async function pay() {
    try {
      const cartItems = await getCartByUserId();
      if (cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
      }
    } catch (error) {
      console.error("Error getting cart items:", error);
      return;
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.location.href = '../GUI/CheckOut.html';
  }
 
  document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});
