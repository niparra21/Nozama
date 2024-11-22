const cartItems = [
    { name: "Product 1", price: 50, quantity: 1, image: "product1.jpg" },
    { name: "Product 2", price: 30, quantity: 1, image: "product2.jpg" },
    { name: "Product 3", price: 20, quantity: 1, image: "product3.jpg" },
  ];
  
  function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const totalPriceContainer = document.getElementById('totalPrice');
    cartItemsContainer.innerHTML = '';
  
    let totalPrice = 0;
  
    cartItems.forEach((item, index) => {
      totalPrice += item.price * item.quantity;
  
      const cartItemDiv = document.createElement('div');
      cartItemDiv.className = 'cart-item';
      cartItemDiv.innerHTML = `
        <div class="cart-item-details">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-name">${item.name}</div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button onclick="updateQuantity(${index}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity(${index}, 1)">+</button>
          </div>
          <button class="remove-button" onclick="removeItem(${index})">Remove</button>
        </div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      `;
      cartItemsContainer.appendChild(cartItemDiv);
    });
  
    totalPriceContainer.textContent = `$${totalPrice.toFixed(2)}`;
  }
  
  function updateQuantity(index, change) {
    if (cartItems[index].quantity + change > 0) {
      cartItems[index].quantity += change;
      renderCart();
    }
  }
  
  function removeItem(index) {
    cartItems.splice(index, 1);
    renderCart();
  }
  
  function pay() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    window.location.href = 'CheckOut.html';
  }
 
  renderCart();