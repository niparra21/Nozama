let currentStep = 1;
const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

function updatePaymentFields() {
  const paymentMethod = document.getElementById('paymentMethod').value;
  const paymentFields = document.getElementById('paymentFields');
  paymentFields.innerHTML = ''; // Clear previous fields

  if (paymentMethod === 'creditCard') {
    paymentFields.innerHTML = `
      <input type="text" placeholder="Card Number (if applicable)" required>
      <input type="text" placeholder="Expiration Date (MM/YY)" required>
      <input type="text" placeholder="CVV" required>
    `;
  } else if (paymentMethod === 'paypal') {
    paymentFields.innerHTML = `
      <input type="text" placeholder="Account Email" required>
      <input type="password" placeholder="Password" required>
    `;
  } else if (paymentMethod === 'bankTransfer') {
    paymentFields.innerHTML = `
      <input type="text" placeholder="Account Number" required>
    `;
  }
}

function placeOrder() {
  if (currentStep === 3) {
    const shippingInputs = document.querySelectorAll('#step1 input');
    const paymentMethodSelect = document.querySelector('#step2 select');

    if (!shippingInputs || shippingInputs.length < 4 || !paymentMethodSelect) {
      alert("Error: Missing form elements. Please check the form structure.");
      return;
    }

    const orderDetails = {
      shippingAddress: {
        fullName: shippingInputs[0]?.value || "",
        address: shippingInputs[1]?.value || "",
        city: shippingInputs[2]?.value || "",
        postalCode: shippingInputs[3]?.value || "",
        country: shippingInputs[4]?.value || "",
      },
      paymentMethod: paymentMethodSelect?.value || "",
      cartItems: cartItems,
      total: document.getElementById('totalAmount').textContent.replace('Grand Total: $', ''),
    };

    const confirmOrder = confirm(
      `Confirm your order:\n\nShipping Address:\n${orderDetails.shippingAddress.fullName}, ${orderDetails.shippingAddress.address}, ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.postalCode}, ${orderDetails.shippingAddress.country}\n\nTotal: $${orderDetails.total}\n\nDo you want to place the order?`
    );

    if (!confirmOrder) {
      return;
    }

    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

    console.log('Order Placed:', orderDetails);
    alert('Your order has been placed successfully!');
    localStorage.removeItem('cartItems');
    window.location.href = 'orders.html'; 
  }
}

function renderOrderSummary() {
  const orderSummaryContainer = document.getElementById('orderSummary');
  const totalAmountContainer = document.getElementById('totalAmount');
  let totalPrice = 0;

  orderSummaryContainer.innerHTML = '';

  cartItems.forEach(item => {
    totalPrice += item.price * item.quantity;

    const itemDiv = document.createElement('div');
    itemDiv.textContent = `${item.name} - Quantity: ${item.quantity} - Price: $${(item.price * item.quantity).toFixed(2)}`;
    orderSummaryContainer.appendChild(itemDiv);
  });

  totalAmountContainer.textContent = `Grand Total: $${totalPrice.toFixed(2)}`;
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
      alert("Please fill out all required fields.");
      return false;
    }
  }
  return true;
}
