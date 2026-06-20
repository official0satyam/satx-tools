/*
  GST Calculator Logic
  Processes calculations client-side in real-time.
*/

let gstDirection = 'add'; // 'add' | 'remove'

document.addEventListener('DOMContentLoaded', () => {
  const inputs = ['gst-price', 'gst-rate', 'gst-custom-rate'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => calculateGST());
      el.addEventListener('change', () => calculateGST());
    }
  });

  // Check URL path to auto-select calculation mode
  const path = window.location.pathname;
  if (path.includes('reverse') || path.includes('remove') || path.includes('inclusive')) {
    gstDirection = 'remove';
  } else {
    gstDirection = 'add';
  }

  window.initCurrencySelector((symbol) => {
    switchGstTab(gstDirection);
  });
});

function switchGstTab(direction) {
  gstDirection = direction;
  
  const btnAdd = document.getElementById('btn-gst-add');
  const btnRemove = document.getElementById('btn-gst-remove');
  
  const lblPrice = document.getElementById('lbl-gst-price');
  const lblInvoiceNet = document.getElementById('lbl-invoice-net');
  const lblInvoiceTotal = document.getElementById('lbl-invoice-total');
  const invoiceHeader = document.getElementById('lbl-gst-invoice-header');

  const symbol = window.detectLocalCurrency();

  if (direction === 'add') {
    if (btnAdd) btnAdd.classList.add('active');
    if (btnRemove) btnRemove.classList.remove('active');
    if (lblPrice) lblPrice.innerHTML = `Base Price Value (<span class="currency-symbol">${symbol}</span>)`;
    if (lblInvoiceNet) lblInvoiceNet.innerText = "Base Price (Net):";
    if (lblInvoiceTotal) lblInvoiceTotal.innerText = "Gross Price (Total):";
    if (invoiceHeader) invoiceHeader.innerText = "GST Invoice Breakdown (Add Tax)";
  } else {
    if (btnAdd) btnAdd.classList.remove('active');
    if (btnRemove) btnRemove.classList.add('active');
    if (lblPrice) lblPrice.innerHTML = `Gross Price Value (<span class="currency-symbol">${symbol}</span>)`;
    if (lblInvoiceNet) lblInvoiceNet.innerText = "Net Price (Tax Free):";
    if (lblInvoiceTotal) lblInvoiceTotal.innerText = "Gross Price (Inclusive):";
    if (invoiceHeader) invoiceHeader.innerText = "GST Invoice Breakdown (Remove Tax)";
  }

  calculateGST();
}

function toggleCustomGstRate() {
  const rateSelect = document.getElementById('gst-rate');
  const customGroup = document.getElementById('gst-custom-rate-group');
  if (rateSelect && customGroup) {
    if (rateSelect.value === 'custom') {
      customGroup.style.display = 'block';
    } else {
      customGroup.style.display = 'none';
    }
  }
  calculateGST();
}

function calculateGST() {
  const price = parseFloat(document.getElementById('gst-price').value) || 0;
  const rateSelect = document.getElementById('gst-rate');
  
  let rate = 0;
  if (rateSelect) {
    if (rateSelect.value === 'custom') {
      rate = parseFloat(document.getElementById('gst-custom-rate').value) || 0;
    } else {
      rate = parseFloat(rateSelect.value) || 0;
    }
  }

  let netPrice = 0;
  let taxCharged = 0;
  let totalPrice = 0;

  if (gstDirection === 'add') {
    taxCharged = (price * rate) / 100;
    totalPrice = price + taxCharged;
    netPrice = price;
  } else {
    netPrice = price / (1 + (rate / 100));
    taxCharged = price - netPrice;
    totalPrice = price;
  }

  const halfTax = taxCharged / 2;
  const symbol = window.detectLocalCurrency();

  const invBase = document.getElementById('invoice-base');
  const invCgst = document.getElementById('invoice-cgst');
  const invSgst = document.getElementById('invoice-sgst');
  const invTax = document.getElementById('invoice-tax');
  const invTotal = document.getElementById('invoice-total');

  if (invBase) invBase.innerText = `${symbol}${netPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (invCgst) invCgst.innerText = `${symbol}${halfTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (invSgst) invSgst.innerText = `${symbol}${halfTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (invTax) invTax.innerText = `+${symbol}${taxCharged.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (invTotal) invTotal.innerText = `${symbol}${totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function copyGSTResult(btn) {
  const total = document.getElementById('invoice-total').textContent;
  const base = document.getElementById('invoice-base').textContent;
  const tax = document.getElementById('invoice-tax').textContent;
  const mode = gstDirection === 'add' ? 'Add GST (Exclusive)' : 'Remove GST (Inclusive)';
  const text = `Calculation: ${mode} | Net Price: ${base} | GST Tax: ${tax} | Gross Invoice Total: ${total}`;
  window.copyToClipboard(text, btn);
}

// Bind to window for HTML triggers
window.switchGstTab = switchGstTab;
window.toggleCustomGstRate = toggleCustomGstRate;
window.calculateGST = calculateGST;
window.copyGSTResult = copyGSTResult;
