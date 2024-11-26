  
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
  

  async function renderOrders() {
    const orderList = document.getElementById("orderList");
    orderList.innerHTML = "";
    const UserOrders = await fetchOrders();
    
  
    if (UserOrders.length === 0) {
      orderList.innerHTML = "<p>No orders found.</p>";
      return;
    }
  
    for (const order of UserOrders) {
      const orderDiv = document.createElement("div");
      orderDiv.className = "order-item";
      const orderLineInfo = await fetchOrdersLine(order.OrderID);
      const TotalPrice = orderLineInfo[0].TotalPrice;
      const AmountItems = orderLineInfo[0].AmountItems;
      
  
      orderDiv.innerHTML = `
        <div class="order-item-details">
          <span>Order #${order.OrderID}</span>
          <span>${AmountItems} items</span>
          <span>Total: $${TotalPrice}</span>
          <span>Shipping Address: ${order.Location}</span>
        </div>
        <div class="order-status">${order.Status}</div>
      `;
  
      orderDiv.addEventListener("click", () => showPopup(orderLineInfo));
  
      orderList.appendChild(orderDiv);
    }
  }
  
async function fetchOrders() {
  const UserID = sessionStorage.getItem('UserID');
  const params = {UserID: UserID};

  try {
    const orders = await executeProcedure('sp_get_orders_by_user',params);
    return orders.data[0];
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

async function fetchOrdersLine(OrderID) {
  params = {OrderID: OrderID};
  try {
    const orderLine = await executeProcedure('sp_get_order_lines_by_order', params);
    return orderLine.data[0];
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

function showPopup(orderLineInfo) {
  const popup = document.getElementById("orderDetailsPopup");
  const orderDetailsList = document.getElementById("orderDetailsList");

  // Clear previous content
  orderDetailsList.innerHTML = "";

  // Add new content
  for (const item of orderLineInfo) {
    const itemDiv = document.createElement("div");
    itemDiv.className = "product-item";

    itemDiv.innerHTML = `
      <img src="${item.ImgURL || 'https://via.placeholder.com/100'}"">
      <div class="product-details">
        <span><strong>Name:</strong> ${item.ProductName}</span>
        <span><strong>Base Price:</strong> $${item.BasePrice.toFixed(2)}</span>
        <span><strong>Discount Percent:</strong> ${item.DiscountPercentage.toFixed(2)}%</span>
        <span><strong>Amount:</strong> ${item.Amount}</span>
        <span><strong>Total:</strong> $${(item.BasePrice * (1 - item.DiscountPercentage / 100) * item.Amount).toFixed(2)}</span>
      </div>
    `;
    orderDetailsList.appendChild(itemDiv);
  }

  // Show the popup
  popup.classList.remove("hidden");

  // Close popup on outside click
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closePopup();
  });
}


function closePopup() {
  const popup = document.getElementById("orderDetailsPopup");
  popup.classList.add("hidden");
}


  
  renderOrders();