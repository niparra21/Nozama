let currentStep = 1;
const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

function updatePaymentFields() {
  const paymentMethod = document.getElementById('paymentMethod').value;
  const paymentFields = document.getElementById('paymentFields');
  paymentFields.innerHTML = '';

  if (paymentMethod === 'creditCard') {
    paymentFields.innerHTML = `
    <input id="cardNumber"
      type="text"
      placeholder="Card Number (16 digits)"
      required
      oninput="this.value = this.value.replace(/[^0-9]/g, '')"
      title="Card number must be 16 digits"
      maxlength="16">

        
      <div>
        <label for="expirationMonth">Expiration Date:</label>
        <select id="expirationMonth" required>
          <option value="" disabled selected>Month</option>
          ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}
        </select>
        
        <select id="expirationYear" required>
          <option value="" disabled selected>Year</option>
          ${Array.from({ length: 10 }, (_, i) => {
            const year = new Date().getFullYear() + i;
            return `<option value="${year}">${year}</option>`;
          }).join('')}
        </select>
      </div>
      
      <input id="cvv"
        type="text" 
        placeholder="CVV (3 digits)" 
        maxlength="3" 
        required 
        oninput="this.value = this.value.replace(/[^0-9]/g, '')"
        title="CVV must be 3 digits">
    `;
  } else if (paymentMethod === 'paypal') {
    paymentFields.innerHTML = `
      <input id="paypalEmail"
        type="email" 
        placeholder="Account Email" 
        required 
        title="Enter a valid email address">
      <input id="paypalPassword"
        type="password" 
        placeholder="Password" 
        required 
        title="Enter your PayPal password">
    `;
  } else if (paymentMethod === 'bankTransfer') {
    paymentFields.innerHTML = `
      <input 
        type="text" 
        placeholder="Account Number (20 digits)" 
        maxlength="20" 
        pattern="\\d{20}" 
        required 
        oninput="this.value = this.value.replace(/[^0-9]/g, '')"
        title="Bank account number must be 20 digits">
    `;
  }
}

async function getUserInfo() {
  const UserID = sessionStorage.getItem('UserID');
  const params = {UserID: UserID};
  try {
    const result = await executeProcedure('sp_get_user_by_id', params);
    const user = result.data[0][0];
    sessionStorage.setItem('UserFullName', user.FirstName + ' ' + user.LastName);
    sessionStorage.setItem('UserEmail', user.Email);
    sessionStorage.setItem('UserPassword', user.Password);
    
  } catch {
    console.log('Error fetching user info');
    }
}

async function placeOrder() {
  const UserID = sessionStorage.getItem('UserID');
  const orderParams = {UserID: UserID, Status: 'P', Location: sessionStorage.getItem('Location')};

  const stockStatus = await verifyStock();
  if (!stockStatus){
    return;
  }
  
  try {
    const result = await executeProcedure('sp_add_order', orderParams);
    const orderID = result.data[0][0].NewOrderID;
    
    const orderLineFinal = await addOrderLine(orderID);    

    
    alert('Your order has been placed successfully!');    
    const reducedStock =  await reduceStock();

    const clearedCart = await clearCart();

    // Redirect to order history page
    window.location.href = 'Orders.html';

    return orderID;
    
  } catch {
    console.log('Error placing order');
  }
}

async function clearCart() {
  const UserID = sessionStorage.getItem('UserID');
  const params = {UserID: UserID};
  try {
    const result = await executeProcedure('sp_clear_shopping_cart', params);
    console.log('Cart cleared successfully');
  } catch {
    console.log('Error clearing cart');
  }
}

async function reduceStock() {
  const items = await getUserCart();
  for (const item of items) {
    const productID = item.ProductID;
    const Amount = item.Amount;
    const params = {ProductID: productID, Amount: Amount};
    try {
      const result = await executeProcedure('sp_update_product_stock', params);
      console.log('Stock reduced successfully');
    } catch {
      console.log('Error reducing stock');
    }
  }
}

async function addOrderLine(orderID) {
  const cartItems = await getUserCart();
  
  for (const item of cartItems){
      const lineNumber = await getOrderLineNumber(orderID);
      try {
        const newLineParams = {OrderID: orderID, Line: lineNumber, ProductID: item.ProductID, Amount: item.Amount};
        const result = await executeProcedure('sp_add_order_line', newLineParams);
        console.log('Order line added successfully');
        
      } catch {
        console.log('Error adding order line');
      }

    } 
}

async function verifyStock() {
  const cartItems = await getUserCart();
  for (const item of cartItems){
    const stock = item.Stock;
    if (stock < item.Amount) {
      alert('Insufficient stock for product ' + item.ProductName + '. There are only ' + stock + ' units available.');
      return false;
    } else
    return true;
  }
}


async function getOrderLineNumber(orderID) {
  const params = {OrderID: orderID};
  try {
    const result = await executeProcedure('sp_get_order_lines_by_orderid', params);
    const orderLineNumber = result.data[0].length + 1;
    console.log('Order Line Number', orderLineNumber);
    return orderLineNumber;
  } catch {
    console.log('Error fetching order line number');
  }
}

async function getUserCart() {
  const UserID = sessionStorage.getItem("UserID");
  const params = {UserID: UserID};

  try {
    const result = await executeProcedure('sp_get_shopping_carts_by_user', params);
    const cartItems = result.data[0];
    console.log('Items', cartItems);
    return cartItems;
  } catch {
    console.log('Error fetching user cart');
  }
}

async function renderOrderSummary() {
  const orderSummaryContainer = document.getElementById('orderSummary');
  const subTotalPriceContainer = document.getElementById('subtotalAmount');
  const totalAmountContainer = document.getElementById('totalAmount');
  const shippingAmountContainer = document.getElementById('shippingAmount');
  
  let subtotalPrice = 0;
  let totalAmount = 0;
  let shippingAmount = 10;
  
  const cartItems = await getUserCart();

  orderSummaryContainer.innerHTML = '';

  cartItems.forEach(item => {
    subtotalPrice += item.BasePrice * (1 - item.DiscountPercentage / 100) * item.Amount;

    const itemDiv = document.createElement('div');
    const itemImage = document.createElement('img');
    const itemText = document.createElement('span');

    itemImage.src = item.ImgURL;
    itemImage.alt = item.ProductName;
    itemImage.style.maxWidth = '100px';
    itemImage.style.maxHeight = '100px';

    itemText.textContent = `${item.ProductName} - Quantity: ${item.Amount} - Price: $${(item.BasePrice * (1 - item.DiscountPercentage / 100) * item.Amount).toFixed(2)}`;

    // Agregar elementos al contenedor
    itemDiv.appendChild(itemImage);
    itemDiv.appendChild(itemText);
    orderSummaryContainer.appendChild(itemDiv);
  });

  subTotalPriceContainer.textContent = `Subtotal: $${subtotalPrice.toFixed(2)}`;
  shippingAmountContainer.textContent = `Shipping: $${shippingAmount.toFixed(2)}`;
  totalAmount = subtotalPrice + shippingAmount;
  totalAmountContainer.textContent = `Total: $${totalAmount.toFixed(2)}`;
}


function nextStep() {
  if (validateCurrentStep()) {
    document.getElementById(`step${currentStep}`).style.display = "none";
    currentStep++;
    if (currentStep <= 3) {
      document.getElementById(`step${currentStep}`).style.display = "block";
      if (currentStep === 3) {
        renderOrderSummary();
      }
    }
    toggleButtons();
  }
}

function previousStep() {
  document.getElementById(`step${currentStep}`).style.display = "none";
  currentStep--;
  if (currentStep > 0) {
    document.getElementById(`step${currentStep}`).style.display = "block";
  }
  toggleButtons();
}

function toggleButtons() {
  document.querySelector(".previous-step").style.display = currentStep > 1 ? "inline-block" : "none";
  document.querySelector(".next-step").style.display = currentStep === 3 ? "none" : "inline-block";
  document.querySelector(".place-order").style.display = currentStep === 3 ? "inline-block" : "none";
}

function validateCurrentStep() {
  const inputs = document.querySelectorAll(`#step${currentStep} input, #step${currentStep} select`);
  
  for (let input of inputs) {
    if (!input.checkValidity()) {
      alert(`Error in field "${input.placeholder || input.id}": ${input.title || "Invalid input."}`);
      input.focus();
      return false;
    }
  }

  if (currentStep === 1) {
    const country = document.getElementById('countrySelect').value;
    const city = document.getElementById('city').value;
    const address = document.getElementById('address').value;
    const postalCode = document.getElementById('postalCode').value;

    if (!country || !city || !address || !postalCode) {
      alert("Please fill in all the required fields.");
      return false;
    }

    if (postalCode.length !== 5) {
      alert("Postal code must be 5 digits.");
      document.getElementById('postalCode').focus();
      return false;
    }
    sessionStorage.setItem('Location', `${address}, ${city}, ${postalCode}, ${country}`);
    console.log('Location', sessionStorage.getItem('Location'));
    
  }

  if (currentStep === 2) {
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (paymentMethod === 'creditCard') {
      const cardNumber = document.getElementById('cardNumber').value;
      const expirationMonth = document.getElementById('expirationMonth').value;
      const expirationYear = document.getElementById('expirationYear').value;
      const cvv = document.getElementById('cvv').value;
      console.log('aaaaaaaaaaaaaaaaaaaa',cardNumber);
      if (cardNumber.length !== 16) {
        alert("Card Number must be 16 digits.");
        document.getElementById('cardNumber').focus();
        return false;
      }

      if (!expirationMonth || !expirationYear) {
        alert("Please select the expiration date.");
        document.getElementById('expirationMonth').focus();
        return false;
      }

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (
        (parseInt(expirationYear) === currentYear && parseInt(expirationMonth) < currentMonth) ||
        parseInt(expirationYear) < currentYear
      ) {
        alert("Expiration date must be in the future.");
        document.getElementById('expirationMonth').focus();
        return false;
      }

      if (cvv.length !== 3) {
        alert("CVV must be 3 digits.");
        document.getElementById('cvv').focus();
        return false;
      }
    } else if (paymentMethod === 'paypal') {
      const accountEmail = document.getElementById('paypalEmail').value;
      const password = document.getElementById('paypalPassword').value;

      if (accountEmail !== sessionStorage.getItem('UserEmail')) {
        alert("Email does not match the registered account email.");
        document.getElementById('paypalEmail').focus();
        return false;
      }

      if (password !== sessionStorage.getItem('UserPassword')) {
        alert("Password is incorrect.");
        document.getElementById('paypalPassword').focus();
        return false;
      }
    } else if (paymentMethod === 'bankTransfer') {
      const accountNumber = document.querySelector('input[placeholder="Account Number (20 digits)"]').value;

      if (accountNumber.length !== 20) {
        alert("Bank Account Number must be 20 digits.");
        document.querySelector('input[placeholder="Account Number (20 digits)"]').focus();
        return false;
      }
    }
  }

  return true;
}



document.getElementById('previousStep').addEventListener('click', previousStep);
document.getElementById('nextStep').addEventListener('click', nextStep);
document.getElementById('placeOrder').addEventListener('click', placeOrder);
document.getElementById('paymentMethod').addEventListener('change', updatePaymentFields);

document.addEventListener('DOMContentLoaded', () => { 
    getUserInfo();
     
});


function populateExpirationDateFields() {
  const expirationMonth = document.getElementById('expirationMonth');
  const expirationYear = document.getElementById('expirationYear');

  for (let i = 1; i <= 12; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    expirationMonth.appendChild(option);
  }

  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 10; i++) {
    const option = document.createElement('option');
    option.value = currentYear + i;
    option.textContent = currentYear + i;
    expirationYear.appendChild(option);
  }
}

document.addEventListener('DOMContentLoaded', populateExpirationDateFields);
