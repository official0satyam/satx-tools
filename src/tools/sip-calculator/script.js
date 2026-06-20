let currentSipMode = 'monthly';

function switchSipTab(mode) {
  currentSipMode = mode;
  
  // Toggle buttons active classes
  const btnMonthly = document.getElementById('btn-sip-monthly');
  const btnLumpsum = document.getElementById('btn-sip-lumpsum');
  const amountSlider = document.getElementById('sip-amount');
  const amountNum = document.getElementById('sip-amount-num');
  const symbol = window.detectLocalCurrency();
  
  if (mode === 'monthly') {
    btnMonthly.classList.add('active');
    btnLumpsum.classList.remove('active');
    document.getElementById('lbl-sip-amount').innerHTML = `Monthly Investment (<span class="currency-symbol">${symbol}</span>)`;
    
    // Reset limits for monthly SIP
    amountSlider.min = 100;
    amountSlider.max = 50000;
    amountSlider.step = 100;
    if (parseFloat(amountNum.value) > 50000) {
      amountNum.value = 2000;
      amountSlider.value = 2000;
    }
  } else {
    btnMonthly.classList.remove('active');
    btnLumpsum.classList.add('active');
    document.getElementById('lbl-sip-amount').innerHTML = `Lumpsum Amount (<span class="currency-symbol">${symbol}</span>)`;
    
    // Reset limits for lumpsum
    amountSlider.min = 1000;
    amountSlider.max = 1000000;
    amountSlider.step = 1000;
    if (parseFloat(amountNum.value) < 1000) {
      amountNum.value = 10000;
      amountSlider.value = 10000;
    }
  }
  
  calculateSIP();
}

function calculateSIP() {
  const amountSlider = document.getElementById('sip-amount');
  const amountNum = document.getElementById('sip-amount-num');
  const rateSlider = document.getElementById('sip-rate');
  const rateNum = document.getElementById('sip-rate-num');
  const yearsSlider = document.getElementById('sip-years');
  const yearsNum = document.getElementById('sip-years-num');

  const principal = parseFloat(amountSlider.value) || 0;
  const annualRate = parseFloat(rateSlider.value) || 0;
  const years = parseFloat(yearsSlider.value) || 0;
  const symbol = window.detectLocalCurrency();

  // Sync labels & text inputs
  document.getElementById('sip-amount-lbl').innerHTML = `<span class="currency-symbol">${symbol}</span>` + principal.toLocaleString();
  amountNum.value = principal;

  document.getElementById('sip-rate-lbl').innerText = annualRate.toFixed(1) + '%';
  rateNum.value = annualRate;

  document.getElementById('sip-years-lbl').innerText = years + (years === 1 ? ' Year' : ' Years');
  yearsNum.value = years;

  let investedAmount = 0;
  let maturityValue = 0;
  let estimatedReturns = 0;

  if (currentSipMode === 'monthly') {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;
    investedAmount = principal * months;
    
    if (monthlyRate === 0) {
      maturityValue = investedAmount;
    } else {
      maturityValue = principal * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    }
  } else {
    // Lumpsum
    investedAmount = principal;
    maturityValue = principal * Math.pow(1 + (annualRate / 100), years);
  }

  estimatedReturns = maturityValue - investedAmount;
  if (estimatedReturns < 0) estimatedReturns = 0;

  // Render values
  document.getElementById('sip-output-val').innerText = symbol + maturityValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('sip-res-invested').innerText = symbol + investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('sip-res-returns').innerText = '+' + symbol + estimatedReturns.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('sip-res-total').innerText = symbol + maturityValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Update progress bars
  let investedPct = 100;
  let returnsPct = 0;

  if (maturityValue > 0) {
    investedPct = Math.round((investedAmount / maturityValue) * 100);
    returnsPct = 100 - investedPct;
  }

  document.getElementById('sip-bar-invested').style.width = investedPct + '%';
  document.getElementById('sip-bar-returns').style.width = returnsPct + '%';
  document.getElementById('sip-pct-invested').innerText = investedPct + '%';
  document.getElementById('sip-pct-returns').innerText = returnsPct + '%';
}

function syncSIPSliders(type) {
  if (type === 'amount') {
    const num = document.getElementById('sip-amount-num');
    const slider = document.getElementById('sip-amount');
    let val = parseFloat(num.value) || 0;
    const minVal = parseFloat(slider.min);
    const maxVal = parseFloat(slider.max);
    if (val < minVal) val = minVal;
    if (val > maxVal) val = maxVal;
    slider.value = val;
  } else if (type === 'rate') {
    const num = document.getElementById('sip-rate-num');
    const slider = document.getElementById('sip-rate');
    let val = parseFloat(num.value) || 0;
    if (val < 1) val = 1;
    if (val > 30) val = 30;
    slider.value = val;
  } else if (type === 'years') {
    const num = document.getElementById('sip-years-num');
    const slider = document.getElementById('sip-years');
    let val = parseFloat(num.value) || 0;
    if (val < 1) val = 1;
    if (val > 40) val = 40;
    slider.value = val;
  }
  calculateSIP();
}

function copySIPResult(btn) {
  const maturity = document.getElementById('sip-output-val').innerText;
  const invested = document.getElementById('sip-res-invested').innerText;
  const returns = document.getElementById('sip-res-returns').innerText;
  const duration = document.getElementById('sip-years-lbl').innerText;
  const rate = document.getElementById('sip-rate-lbl').innerText;

  const modeText = currentSipMode === 'monthly' ? 'Monthly SIP' : 'Lumpsum Deposit';
  const amountLabel = currentSipMode === 'monthly' ? 'Monthly Contribution' : 'Deposit Capital';

  const text = `Investment Return Estimation (${modeText}):
- Period: ${duration} @ ${rate} Expected returns
- Invested Capital: ${invested}
- Estimated Returns: ${returns}
- Portfolio Valuation: ${maturity}

Calculated via SatX Tools.`;
  copyToClipboard(text, btn);
}

// Initial triggers
document.addEventListener('DOMContentLoaded', () => {
  window.initCurrencySelector(calculateSIP);
});
