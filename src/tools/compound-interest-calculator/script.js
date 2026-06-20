/*
  Compound Interest Calculator Logic
  Processes calculations client-side in real-time.
*/

let currentInterestType = 'compound'; // 'compound' or 'simple'

document.addEventListener('DOMContentLoaded', () => {
  window.initCurrencySelector(calculateCI);
});

function setInterestType(type, btn) {
  currentInterestType = type;
  
  // Toggle active button
  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Toggle frequency visibility (simple interest doesn't compound)
  const freqWrapper = document.getElementById('ci-freq-wrapper');
  if (freqWrapper) {
    freqWrapper.style.display = type === 'simple' ? 'none' : 'block';
  }

  calculateCI();
}

function calculateCI() {
  const principal = parseFloat(document.getElementById('ci-principal').value) || 0;
  const contribution = parseFloat(document.getElementById('ci-contribution').value) || 0;
  const rate = parseFloat(document.getElementById('ci-rate').value) || 0;
  const years = parseInt(document.getElementById('ci-years').value) || 1;
  const compoundPerYear = parseInt(document.getElementById('ci-frequency').value) || 12;

  const symbol = window.detectLocalCurrency();

  // Update labels
  document.getElementById('ci-rate-lbl').innerText = `${rate}%`;
  document.getElementById('ci-years-lbl').innerText = `${years} ${years === 1 ? 'Year' : 'Years'}`;

  let balance = principal;
  let totalDeposits = principal;
  const months = years * 12;
  const r = rate / 100;

  if (currentInterestType === 'simple') {
    const principalInterest = principal * r * years;
    const deposits = contribution * months;
    let depositInterest = 0;
    
    // Each month's contribution earns simple interest for the remaining time
    for (let m = 1; m <= months; m++) {
      depositInterest += contribution * r * ((months - m) / 12);
    }
    
    totalDeposits = principal + deposits;
    balance = totalDeposits + principalInterest + depositInterest;
  } else {
    // Compound interest simulation
    balance = principal;
    totalDeposits = principal;
    
    for (let m = 1; m <= months; m++) {
      // Add monthly deposit at start of month
      balance += contribution;
      totalDeposits += contribution;

      // Apply compounding
      if (compoundPerYear === 12) {
        balance *= (1 + r / 12);
      } else if (compoundPerYear === 365) {
        // Daily compounding approximate over a month (approx 30.4375 days)
        balance *= Math.pow(1 + r / 365, 30.4375);
      } else if (compoundPerYear === 4) {
        if (m % 3 === 0) {
          balance *= (1 + r / 4);
        }
      } else if (compoundPerYear === 2) {
        if (m % 6 === 0) {
          balance *= (1 + r / 2);
        }
      } else if (compoundPerYear === 1) {
        if (m % 12 === 0) {
          balance *= (1 + r / 1);
        }
      }
    }
  }

  const interestEarned = Math.max(0, balance - totalDeposits);

  // Update UI outputs
  document.getElementById('ci-out-total').innerText = `${symbol}${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('ci-out-contributions').innerText = `${symbol}${totalDeposits.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('ci-out-interest').innerText = `+${symbol}${interestEarned.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  // Update visual progress bar
  const outTotal = balance;
  if (outTotal > 0) {
    const depositPct = Math.round((totalDeposits / outTotal) * 100);
    const interestPct = 100 - depositPct;

    document.getElementById('ci-bar-contributions').style.width = `${depositPct}%`;
    document.getElementById('ci-bar-interest').style.width = `${interestPct}%`;

    document.getElementById('ci-pct-contributions').innerText = `${depositPct}%`;
    document.getElementById('ci-pct-interest').innerText = `${interestPct}%`;
  } else {
    document.getElementById('ci-bar-contributions').style.width = `50%`;
    document.getElementById('ci-bar-interest').style.width = `50%`;
    document.getElementById('ci-pct-contributions').innerText = `50%`;
    document.getElementById('ci-pct-interest').innerText = `50%`;
  }
}

function syncCISliders(type) {
  const rateSlider = document.getElementById('ci-rate');
  const rateNum = document.getElementById('ci-rate-num');
  const yearsSlider = document.getElementById('ci-years');
  const yearsNum = document.getElementById('ci-years-num');

  if (type === 'rate') {
    rateNum.value = rateSlider.value;
  } else if (type === 'rate-num') {
    let val = parseFloat(rateNum.value) || 0;
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    rateSlider.value = val;
    rateNum.value = val;
  } else if (type === 'years') {
    yearsNum.value = yearsSlider.value;
  } else if (type === 'years-num') {
    let val = parseInt(yearsNum.value) || 1;
    if (val < 1) val = 1;
    if (val > 100) val = 100;
    yearsSlider.value = val;
    yearsNum.value = val;
  }

  calculateCI();
}

function copyCIResult(btn) {
  const symbol = window.detectLocalCurrency();
  const principal = parseFloat(document.getElementById('ci-principal').value) || 0;
  const contribution = parseFloat(document.getElementById('ci-contribution').value) || 0;
  const rate = parseFloat(document.getElementById('ci-rate').value) || 0;
  const years = parseInt(document.getElementById('ci-years').value) || 1;
  const freqText = document.getElementById('ci-frequency').options[document.getElementById('ci-frequency').selectedIndex].text;

  const totalVal = document.getElementById('ci-out-total').innerText;
  const contribVal = document.getElementById('ci-out-contributions').innerText;
  const interestVal = document.getElementById('ci-out-interest').innerText;

  const text = `Investment Growth Summary (${currentInterestType === 'compound' ? 'Compound' : 'Simple'} Interest):
- Initial Principal: ${symbol}${principal.toLocaleString()}
- Monthly Contribution: ${symbol}${contribution.toLocaleString()}
- Interest Rate: ${rate}% P.A.
- Period: ${years} years
${currentInterestType === 'compound' ? `- Compounding: ${freqText}\n` : ''}- Total Contributed: ${contribVal}
- Total Interest Earned: ${interestVal}
- Future Maturity Value: ${totalVal}`;

  window.copyToClipboard(text, btn);
}

// Bind globals
window.setInterestType = setInterestType;
window.calculateCI = calculateCI;
window.syncCISliders = syncCISliders;
window.copyCIResult = copyCIResult;
