function calculateEMI() {
  const amountInput = document.getElementById('emi-amount');
  const interestInput = document.getElementById('emi-interest');
  const tenureInput = document.getElementById('emi-tenure');
  const tenureUnit = document.getElementById('emi-tenure-unit').value;

  const principal = parseFloat(amountInput.value) || 0;
  const ratePerAnnum = parseFloat(interestInput.value) || 0;
  let tenure = parseFloat(tenureInput.value) || 0;

  const symbol = window.detectLocalCurrency();

  // Sync labels
  document.getElementById('emi-amount-lbl').innerText = symbol + principal.toLocaleString();
  document.getElementById('emi-amount-num').value = principal;

  document.getElementById('emi-interest-lbl').innerText = ratePerAnnum.toFixed(1) + '%';
  document.getElementById('emi-interest-num').value = ratePerAnnum;

  document.getElementById('emi-tenure-lbl').innerText = tenure + (tenureUnit === 'years' ? (tenure === 1 ? ' Year' : ' Years') : (tenure === 1 ? ' Month' : ' Months'));

  // Calculate monthly payment (EMI)
  const monthlyRate = ratePerAnnum / 12 / 100;
  const numberOfMonths = tenureUnit === 'years' ? tenure * 12 : tenure;

  let monthlyPayment = 0;
  let totalInterest = 0;
  let totalRepayment = 0;

  if (principal > 0 && numberOfMonths > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = principal / numberOfMonths;
      totalRepayment = principal;
      totalInterest = 0;
    } else {
      monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
      totalRepayment = monthlyPayment * numberOfMonths;
      totalInterest = totalRepayment - principal;
    }
  }

  // Format and update outputs
  document.getElementById('emi-output-val').innerText = symbol + monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('emi-res-principal').innerText = symbol + principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('emi-res-interest').innerText = '+' + symbol + totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('emi-res-total').innerText = symbol + totalRepayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Update visual chart progress bars
  let principalPct = 100;
  let interestPct = 0;

  if (totalRepayment > 0) {
    principalPct = Math.round((principal / totalRepayment) * 100);
    interestPct = 100 - principalPct;
  }

  document.getElementById('emi-bar-principal').style.width = principalPct + '%';
  document.getElementById('emi-bar-interest').style.width = interestPct + '%';
  document.getElementById('emi-pct-principal').innerText = principalPct + '%';
  document.getElementById('emi-pct-interest').innerText = interestPct + '%';
}

function syncEMISliders(type) {
  if (type === 'amount') {
    const num = document.getElementById('emi-amount-num');
    const slider = document.getElementById('emi-amount');
    let val = parseFloat(num.value) || 0;
    if (val < 1000) val = 1000;
    if (val > 1000000) val = 1000000;
    slider.value = val;
  } else if (type === 'interest') {
    const num = document.getElementById('emi-interest-num');
    const slider = document.getElementById('emi-interest');
    let val = parseFloat(num.value) || 0;
    if (val < 1) val = 1;
    if (val > 25) val = 25;
    slider.value = val;
  }
  calculateEMI();
}

function updateEMITenureLimits() {
  const tenureInput = document.getElementById('emi-tenure');
  const unit = document.getElementById('emi-tenure-unit').value;

  if (unit === 'years') {
    tenureInput.min = 1;
    tenureInput.max = 30;
    tenureInput.step = 1;
    tenureInput.value = Math.min(30, Math.max(1, Math.round(tenureInput.value / 12) || 5));
  } else {
    tenureInput.min = 1;
    tenureInput.max = 360;
    tenureInput.step = 1;
    tenureInput.value = Math.min(360, Math.max(1, tenureInput.value * 12 || 60));
  }
  calculateEMI();
}

function copyEMIResult(btn) {
  const monthly = document.getElementById('emi-output-val').innerText;
  const principal = document.getElementById('emi-res-principal').innerText;
  const interest = document.getElementById('emi-res-interest').innerText;
  const total = document.getElementById('emi-res-total').innerText;
  const tenure = document.getElementById('emi-tenure-lbl').innerText;

  const text = `Loan Repayment Summary (EMI):
- Loan Tenure: ${tenure}
- Monthly Installment (EMI): ${monthly}
- Principal Amount: ${principal}
- Interest Payable: ${interest}
- Total Repayment: ${total}

Calculated via SatX Tools.`;
  copyToClipboard(text, btn);
}

// Initial calculation on load
document.addEventListener('DOMContentLoaded', () => {
  window.initCurrencySelector(calculateEMI);
});
