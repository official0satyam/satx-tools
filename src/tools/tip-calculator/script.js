/*
  Tip Calculator Logic
  Processes bill splits and gratuity calculations client-side.
*/

document.addEventListener('DOMContentLoaded', () => {
  window.initCurrencySelector(calculateTip);
});

function calculateTip() {
  const bill = parseFloat(document.getElementById('tip-bill').value) || 0;
  const pct = parseFloat(document.getElementById('tip-pct').value) || 0;
  const people = parseInt(document.getElementById('tip-people').value) || 1;

  const symbol = window.detectLocalCurrency();

  // Calculations
  const totalTip = (bill * pct) / 100;
  const grandTotal = bill + totalTip;
  
  const tipPerPerson = totalTip / people;
  const totalPerPerson = grandTotal / people;

  // Update labels
  document.getElementById('tip-pct-lbl').innerText = `${pct}%`;
  document.getElementById('tip-people-lbl').innerText = `${people} ${people === 1 ? 'Person' : 'People'}`;

  // Update outputs
  document.getElementById('tip-out-per-person-tip').innerText = `${symbol}${tipPerPerson.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('tip-out-per-person-total').innerText = `${symbol}${totalPerPerson.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('tip-out-base').innerText = `${symbol}${bill.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('tip-out-tip').innerText = `+${symbol}${totalTip.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('tip-out-total').innerText = `${symbol}${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function setTipPreset(value, btn) {
  // Update slider and input
  const slider = document.getElementById('tip-pct');
  if (slider) {
    slider.value = value;
  }
  
  // Toggle active class on preset buttons
  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  calculateTip();
}

function syncTipSliders(type) {
  const pctSlider = document.getElementById('tip-pct');
  const peopleSlider = document.getElementById('tip-people');
  const peopleNum = document.getElementById('tip-people-num');

  if (type === 'pct') {
    // If user interacts with custom percentage slider, deselect any preset buttons
    const presetContainer = document.querySelector('.segmented-control');
    if (presetContainer) {
      const buttons = presetContainer.querySelectorAll('button');
      buttons.forEach(b => b.classList.remove('active'));
    }
  } else if (type === 'people-range') {
    peopleNum.value = peopleSlider.value;
  } else if (type === 'people-num') {
    let val = parseInt(peopleNum.value) || 1;
    if (val < 1) val = 1;
    if (val > 100) val = 100; // soft cap
    peopleSlider.value = val;
    peopleNum.value = val;
  }

  calculateTip();
}

function copyTipResult(btn) {
  const symbol = window.detectLocalCurrency();
  const bill = parseFloat(document.getElementById('tip-bill').value) || 0;
  const pct = parseFloat(document.getElementById('tip-pct').value) || 0;
  const people = parseInt(document.getElementById('tip-people').value) || 1;

  const totalTip = (bill * pct) / 100;
  const grandTotal = bill + totalTip;
  const tipPerPerson = totalTip / people;
  const totalPerPerson = grandTotal / people;

  const text = `Bill Split Details:
- Base Bill: ${symbol}${bill.toFixed(2)}
- Tip: ${pct}% (${symbol}${totalTip.toFixed(2)})
- Split: ${people} ${people === 1 ? 'person' : 'people'}
- Tip per Person: ${symbol}${tipPerPerson.toFixed(2)}
- Total per Person: ${symbol}${totalPerPerson.toFixed(2)}
- Grand Total: ${symbol}${grandTotal.toFixed(2)}`;

  window.copyToClipboard(text, btn);
}

// Bind globals
window.calculateTip = calculateTip;
window.setTipPreset = setTipPreset;
window.syncTipSliders = syncTipSliders;
window.copyTipResult = copyTipResult;
