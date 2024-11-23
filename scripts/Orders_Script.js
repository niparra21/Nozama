const existingOrders = [
    {
      orderId: "12345",
      cartItems: [
        { name: "Product A", quantity: 2, price: 100 },
        { name: "Product B", quantity: 1, price: 50 },
      ],
      total: 250,
      shippingAddress: { fullName: "John Doe", city: "City A" },
      status: "Delivered",
    },
  ];
  
  const newOrder = JSON.parse(localStorage.getItem("orderDetails"));
  
  if (newOrder) {
    existingOrders.push({
      orderId: `123${existingOrders.length + 1}`,
      ...newOrder,
      status: "Pending",
    });
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
  
  function renderOrders() {
    const orderList = document.getElementById("orderList");
    orderList.innerHTML = "";
  
    if (existingOrders.length === 0) {
      orderList.innerHTML = "<p>No orders found.</p>";
      return;
    }
  
    existingOrders.forEach((order) => {
      const orderDiv = document.createElement("div");
      orderDiv.className = "order-item";
  
      const itemsCount = order.cartItems.reduce((total, item) => total + item.quantity, 0);
  
      orderDiv.innerHTML = `
        <div class="order-item-details">
          <span>Order #${order.orderId}</span>
          <span>${itemsCount} items</span>
          <span>Total: $${order.total}</span>
          <span>Shipping Address: ${order.shippingAddress.fullName}, ${order.shippingAddress.city}</span>
        </div>
        <div class="order-status">${order.status}</div>
      `;
  
      orderList.appendChild(orderDiv);
    });
  }
  
  renderOrders();