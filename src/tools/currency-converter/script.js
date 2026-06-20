/*
  Currency Converter Logic
  Performs currency conversions locally using fallback rates or updates from a live public API.
*/

// Baseline rates relative to 1 USD
let exchangeRates = {
  "USD": 1.0,
  "INR": 83.50,
  "EUR": 0.92,
  "GBP": 0.79,
  "JPY": 158.00,
  "CAD": 1.37,
  "AUD": 1.50
};

const currencySymbols = {
  "USD": "$",
  "INR": "₹",
  "EUR": "€",
  "GBP": "£",
  "JPY": "¥",
  "CAD": "C$",
  "AUD": "A$"
};

document.addEventListener('DOMContentLoaded', () => {
  loadCachedRates();
  performConversion();
});

function loadCachedRates() {
  try {
    const cached = localStorage.getItem('satx-currency-rates');
    const cachedTime = localStorage.getItem('satx-currency-rates-timestamp');
    
    if (cached && cachedTime) {
      // Rates valid for 24 hours
      if (Date.now() - parseInt(cachedTime) < 24 * 60 * 60 * 1000) {
        exchangeRates = JSON.parse(cached);
        const statusEl = document.getElementById('curr-status');
        if (statusEl) {
          statusEl.innerText = "Rates: Cached";
          statusEl.style.background = "rgba(13, 148, 136, 0.1)";
          statusEl.style.color = "var(--secondary)";
        }
      }
    }
  } catch (e) {
    console.error("Failed to load cached rates", e);
  }
}

function performConversion() {
  const amount = parseFloat(document.getElementById('curr-amount').value) || 0;
  const from = document.getElementById('curr-from').value;
  const to = document.getElementById('curr-to').value;

  const rateFrom = exchangeRates[from];
  const rateTo = exchangeRates[to];

  // Convert to base USD then to destination
  const amountInUSD = amount / rateFrom;
  const convertedAmount = amountInUSD * rateTo;

  // Single unit conversion rate for display
  const singleRate = rateTo / rateFrom;

  const symFrom = currencySymbols[from] || from;
  const symTo = currencySymbols[to] || to;

  // Update UI outputs
  document.getElementById('curr-output-text').innerText = `${symFrom}${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${from} =`;
  document.getElementById('curr-output-val').innerText = `${symTo}${convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('curr-rate-text').innerText = `1 ${from} = ${singleRate.toFixed(4)} ${to}`;

  updatePopularConversions(from, to, singleRate);
}

function swapCurrencies() {
  const fromSelect = document.getElementById('curr-from');
  const toSelect = document.getElementById('curr-to');
  
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;

  performConversion();
}

function updatePopularConversions(from, to, rate) {
  const tableTitle = document.getElementById('curr-table-title');
  const tableContainer = document.getElementById('curr-quick-rates');
  if (!tableTitle || !tableContainer) return;

  const symFrom = currencySymbols[from] || from;
  const symTo = currencySymbols[to] || to;

  tableTitle.innerText = `Popular ${from} to ${to} Conversions`;

  const commonAmounts = [1, 5, 10, 50, 100, 250, 500, 1000];
  let html = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
        <span>${from}</span>
        <span>${to}</span>
      </div>
  `;

  for (let i = 0; i < 4; i++) {
    const val = commonAmounts[i];
    const converted = val * rate;
    html += `
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
        <span>${symFrom}${val}</span>
        <span style="color: var(--primary);">${symTo}${converted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
      </div>
    `;
  }
  html += `</div><div style="display: flex; flex-direction: column; gap: 8px;">`;
  html += `
      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
        <span>${from}</span>
        <span>${to}</span>
      </div>
  `;

  for (let i = 4; i < 8; i++) {
    const val = commonAmounts[i];
    const converted = val * rate;
    html += `
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
        <span>${symFrom}${val}</span>
        <span style="color: var(--primary);">${symTo}${converted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
      </div>
    `;
  }
  html += `</div>`;

  tableContainer.innerHTML = html;
}

function refreshRates(btn) {
  const originalText = btn.innerHTML;
  btn.innerHTML = `
    <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; animation: spin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
    Updating...
  `;
  btn.disabled = true;

  // Fetch from a free public API
  fetch("https://open.er-api.com/v6/latest/USD")
    .then(res => {
      if (!res.ok) throw new Error("API network error");
      return res.json();
    })
    .then(data => {
      if (data && data.rates) {
        // Map supported rates
        Object.keys(exchangeRates).forEach(currency => {
          if (data.rates[currency]) {
            exchangeRates[currency] = data.rates[currency];
          }
        });

        // Save cache
        localStorage.setItem('satx-currency-rates', JSON.stringify(exchangeRates));
        localStorage.setItem('satx-currency-rates-timestamp', Date.now().toString());

        const statusEl = document.getElementById('curr-status');
        if (statusEl) {
          statusEl.innerText = "Rates: Live";
          statusEl.style.background = "rgba(13, 148, 136, 0.15)";
          statusEl.style.color = "var(--secondary)";
        }

        performConversion();
        
        // Show success animation on button
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Rates Updated
        `;
      }
    })
    .catch(err => {
      console.error("Rates fetch failed:", err);
      // Show failed state
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        Failed to Update
      `;
    })
    .finally(() => {
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 2000);
    });
}

function copyConversionResult(btn) {
  const amount = parseFloat(document.getElementById('curr-amount').value) || 0;
  const from = document.getElementById('curr-from').value;
  const to = document.getElementById('curr-to').value;
  const outVal = document.getElementById('curr-output-val').innerText;
  const rateText = document.getElementById('curr-rate-text').innerText;

  const text = `Currency Conversion:
- Input Amount: ${amount.toFixed(2)} ${from}
- Converted Value: ${outVal} (${to})
- Exchange Rate: ${rateText}`;

  window.copyToClipboard(text, btn);
}

// Bind globals
window.performConversion = performConversion;
window.swapCurrencies = swapCurrencies;
window.refreshRates = refreshRates;
window.copyConversionResult = copyConversionResult;
