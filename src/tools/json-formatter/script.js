function beautifyJSON() {
  const input = document.getElementById('json-input').value.trim();
  const outputEl = document.getElementById('json-output');
  const statusEl = document.getElementById('json-status');
  const statusTitle = document.getElementById('json-status-title');
  const statusMsg = document.getElementById('json-status-msg');
  const copyBtn = document.getElementById('btn-copy-json');

  if (input === '') {
    outputEl.value = '';
    statusEl.style.display = 'none';
    copyBtn.disabled = true;
    return;
  }

  try {
    const parsed = JSON.parse(input);
    
    // Update status banner
    statusEl.style.display = 'block';
    statusEl.className = 'result-panel success';
    statusTitle.innerText = 'Valid JSON 💎';
    statusTitle.style.color = 'var(--secondary)';
    statusMsg.innerText = 'JSON structure parsed successfully.';
    statusMsg.style.color = 'var(--text-body)';

    // Get spacing
    const spacingOption = document.getElementById('json-indent').value;
    let spacing = 2;
    if (spacingOption === '4') spacing = 4;
    if (spacingOption === 'tab') spacing = '\t';

    const formatted = JSON.stringify(parsed, null, spacing);
    outputEl.value = formatted;
    copyBtn.disabled = false;

  } catch (err) {
    // Show validation error banner
    statusEl.style.display = 'block';
    statusEl.className = 'result-panel warning';
    statusTitle.innerText = 'Invalid JSON ⚠️';
    statusTitle.style.color = 'var(--primary)';
    statusMsg.innerText = err.message;
    statusMsg.style.color = 'var(--text-body)';

    outputEl.value = '';
    copyBtn.disabled = true;
  }
}

function minifyJSON() {
  const input = document.getElementById('json-input').value.trim();
  const outputEl = document.getElementById('json-output');
  const statusEl = document.getElementById('json-status');
  const statusTitle = document.getElementById('json-status-title');
  const statusMsg = document.getElementById('json-status-msg');
  const copyBtn = document.getElementById('btn-copy-json');

  if (input === '') {
    outputEl.value = '';
    statusEl.style.display = 'none';
    copyBtn.disabled = true;
    return;
  }

  try {
    const parsed = JSON.parse(input);
    
    statusEl.style.display = 'block';
    statusEl.className = 'result-panel success';
    statusTitle.innerText = 'Valid JSON 💎';
    statusTitle.style.color = 'var(--secondary)';
    statusMsg.innerText = 'JSON minified successfully.';
    statusMsg.style.color = 'var(--text-body)';

    const minified = JSON.stringify(parsed);
    outputEl.value = minified;
    copyBtn.disabled = false;

  } catch (err) {
    statusEl.style.display = 'block';
    statusEl.className = 'result-panel warning';
    statusTitle.innerText = 'Invalid JSON ⚠️';
    statusTitle.style.color = 'var(--primary)';
    statusMsg.innerText = err.message;
    statusMsg.style.color = 'var(--text-body)';

    outputEl.value = '';
    copyBtn.disabled = true;
  }
}

function clearJSON() {
  const input = document.getElementById('json-input');
  const output = document.getElementById('json-output');
  const status = document.getElementById('json-status');
  const copyBtn = document.getElementById('btn-copy-json');

  if (input) input.value = '';
  if (output) output.value = '';
  if (status) status.style.display = 'none';
  if (copyBtn) copyBtn.disabled = true;

  if (input) input.focus();
}

function copyJSONOutput(btn) {
  const output = document.getElementById('json-output').value;
  if (output.trim().length > 0) {
    copyToClipboard(output, btn);
  }
}

// Optional auto-validation as user types (debounce supported if needed, here we keep it on button click to avoid constant error flashing)
