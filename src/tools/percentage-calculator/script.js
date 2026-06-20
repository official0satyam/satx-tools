/*
  Percentage Calculator Logic
  Processes calculations client-side in real-time.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Add input event listeners for real-time updates
  const inputs = [
    'val-percent', 'val-total',
    'ratio-part', 'ratio-whole',
    'change-start', 'change-end',
    'diff-val1', 'diff-val2',
    'base-value', 'base-percent'
  ];

  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateAll);
    }
  });

  // Check URL path to auto-select tab for programmatic SEO pages
  const path = window.location.pathname;
  if (path.includes('increase') || path.includes('decrease') || path.includes('change')) {
    switchTab('change');
  } else if (path.includes('ratio')) {
    switchTab('ratio');
  } else if (path.includes('difference')) {
    switchTab('diff');
  } else if (path.includes('what-value') || path.includes('base')) {
    switchTab('base');
  } else {
    switchTab('value');
  }

  // Initial calculation run
  calculateAll();
});

/**
 * Switch tabs dynamically
 * @param {string} activeTab ('value' | 'ratio' | 'change' | 'diff' | 'base')
 */
function switchTab(activeTab) {
  const tabs = ['value', 'ratio', 'change', 'diff', 'base'];
  
  tabs.forEach(tab => {
    const btn = document.getElementById(`btn-tab-${tab}`);
    const panel = document.getElementById(`panel-${tab}`);
    
    if (btn && panel) {
      if (tab === activeTab) {
        btn.classList.add('active');
        panel.style.display = 'block';
      } else {
        btn.classList.remove('active');
        panel.style.display = 'none';
      }
    }
  });
}

/**
 * Triggers all calculations based on currently visible tab inputs
 */
function calculateAll() {
  calculateValue();
  calculateRatio();
  calculateChange();
  calculateDifference();
  calculateBase();
}

/**
 * Tab 1: What is X% of Y?
 */
function calculateValue() {
  const percent = parseFloat(document.getElementById('val-percent').value);
  const total = parseFloat(document.getElementById('val-total').value);
  const resVal = document.getElementById('res-value-val');
  const resLbl = document.getElementById('res-value-lbl');

  if (isNaN(percent) || isNaN(total)) {
    resVal.textContent = '--';
    resLbl.textContent = 'Please enter valid numbers';
    return;
  }

  const result = (percent / 100) * total;
  const formatted = Number(result.toFixed(4));
  
  resVal.textContent = formatted;
  resLbl.textContent = `${percent}% of ${total} is ${formatted}`;
}

/**
 * Tab 2: X is what % of Y?
 */
function calculateRatio() {
  const part = parseFloat(document.getElementById('ratio-part').value);
  const whole = parseFloat(document.getElementById('ratio-whole').value);
  const resVal = document.getElementById('res-ratio-val');
  const resLbl = document.getElementById('res-ratio-lbl');

  if (isNaN(part) || isNaN(whole) || whole === 0) {
    resVal.textContent = '--';
    resLbl.textContent = whole === 0 ? 'Whole value cannot be zero' : 'Please enter valid numbers';
    return;
  }

  const result = (part / whole) * 100;
  const formatted = Number(result.toFixed(4));

  resVal.textContent = `${formatted}%`;
  resLbl.textContent = `${part} is ${formatted}% of ${whole}`;
}

/**
 * Tab 3: % Increase / Decrease (X to Y)
 */
function calculateChange() {
  const start = parseFloat(document.getElementById('change-start').value);
  const end = parseFloat(document.getElementById('change-end').value);
  const resVal = document.getElementById('res-change-val');
  const resLbl = document.getElementById('res-change-lbl');

  if (isNaN(start) || isNaN(end) || start === 0) {
    resVal.textContent = '--';
    resLbl.textContent = start === 0 ? 'Starting value cannot be zero' : 'Please enter valid numbers';
    return;
  }

  const diff = end - start;
  const percentChange = (diff / start) * 100;
  const formatted = Number(Math.abs(percentChange).toFixed(4));

  if (diff > 0) {
    resVal.textContent = `+${formatted}%`;
    resVal.style.color = 'var(--secondary)';
    resLbl.textContent = `Increase of ${formatted}% from ${start} to ${end}`;
  } else if (diff < 0) {
    resVal.textContent = `-${formatted}%`;
    resVal.style.color = 'var(--accent-rose)';
    resLbl.textContent = `Decrease of ${formatted}% from ${start} to ${end}`;
  } else {
    resVal.textContent = '0%';
    resVal.style.color = 'var(--text-main)';
    resLbl.textContent = 'No change';
  }
}

/**
 * Tab 4: Percentage Difference between X and Y
 */
function calculateDifference() {
  const val1 = parseFloat(document.getElementById('diff-val1').value);
  const val2 = parseFloat(document.getElementById('diff-val2').value);
  const resVal = document.getElementById('res-diff-val');
  const resLbl = document.getElementById('res-diff-lbl');

  if (isNaN(val1) || isNaN(val2)) {
    resVal.textContent = '--';
    resLbl.textContent = 'Please enter valid numbers';
    return;
  }

  const diff = Math.abs(val1 - val2);
  const average = (val1 + val2) / 2;

  if (average === 0) {
    resVal.textContent = '0%';
    resLbl.textContent = 'Both values are zero';
    return;
  }

  const result = (diff / average) * 100;
  const formatted = Number(result.toFixed(4));

  resVal.textContent = `${formatted}%`;
  resLbl.textContent = `Difference between ${val1} and ${val2} relative to average`;
}

/**
 * Tab 5: X is Y% of what?
 */
function calculateBase() {
  const value = parseFloat(document.getElementById('base-value').value);
  const percent = parseFloat(document.getElementById('base-percent').value);
  const resVal = document.getElementById('res-base-val');
  const resLbl = document.getElementById('res-base-lbl');

  if (isNaN(value) || isNaN(percent) || percent === 0) {
    resVal.textContent = '--';
    resLbl.textContent = percent === 0 ? 'Percentage rate cannot be zero' : 'Please enter valid numbers';
    return;
  }

  const result = (value / percent) * 100;
  const formatted = Number(result.toFixed(4));

  resVal.textContent = formatted;
  resLbl.textContent = `${value} is ${percent}% of ${formatted}`;
}

// Bind to window for HTML click calls
window.switchTab = switchTab;
