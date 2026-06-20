/*
  Discount Calculator Logic
  Processes calculations client-side in real-time.
*/

document.addEventListener('DOMContentLoaded', () => {
  const inputs = ['disc-price', 'disc-percent', 'disc-additional', 'disc-tax'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => calculateDiscount());
    }
  });
  window.initCurrencySelector(calculateDiscount);
});

function calculateDiscount() {
  const price = parseFloat(document.getElementById('disc-price').value) || 0;
  const percent = parseFloat(document.getElementById('disc-percent').value) || 0;
  const additional = parseFloat(document.getElementById('disc-additional').value) || 0;
  const taxRate = parseFloat(document.getElementById('disc-tax').value) || 0;

  const symbol = window.detectLocalCurrency();

  // Calculate first discount
  const saved1 = (price * percent) / 100;
  const subtotal1 = Math.max(0, price - saved1);

  // Calculate additional discount (stacked)
  const saved2 = (subtotal1 * additional) / 100;
  const subtotal2 = Math.max(0, subtotal1 - saved2);

  const totalSaved = saved1 + saved2;

  // Calculate Sales Tax
  const taxAmount = (subtotal2 * taxRate) / 100;
  const finalPrice = subtotal2 + taxAmount;

  // Update UI Elements
  const outVal = document.getElementById('disc-output-val');
  const outBase = document.getElementById('disc-base');
  const outSaved = document.getElementById('disc-saved');
  const outTaxVal = document.getElementById('disc-tax-val');
  const rowTax = document.getElementById('disc-row-tax');
  const visualBar = document.getElementById('disc-visual-bar');

  if (outBase) outBase.innerText = `${symbol}${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (outSaved) outSaved.innerText = `-${symbol}${totalSaved.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${(percent + additional > 0 ? ((totalSaved / price) * 100).toFixed(0) : 0)}% total off)`;
  
  if (rowTax && outTaxVal) {
    if (taxRate > 0) {
      rowTax.style.display = 'flex';
      outTaxVal.innerText = `+${symbol}${taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    } else {
      rowTax.style.display = 'none';
    }
  }

  if (outVal) outVal.innerText = `${symbol}${finalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  if (visualBar) {
    const percentageCost = price > 0 ? Math.min(100, (finalPrice / price) * 100) : 0;
    visualBar.style.width = `${percentageCost}%`;
  }
}

function copyDiscountResult(btn) {
  const val = document.getElementById('disc-output-val').textContent;
  const base = document.getElementById('disc-base').textContent;
  const saved = document.getElementById('disc-saved').textContent;
  const text = `Original Price: ${base} | Total Saved: ${saved} | Final Sale Price: ${val}`;
  window.copyToClipboard(text, btn);
}

// Bind to window for HTML triggers
window.calculateDiscount = calculateDiscount;
window.copyDiscountResult = copyDiscountResult;
