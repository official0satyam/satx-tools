/*
  Password Generator Logic
  Processes calculations client-side in real-time.
*/

document.addEventListener('DOMContentLoaded', () => {
  const inputs = ['pwd-length', 'pwd-lowercase', 'pwd-uppercase', 'pwd-numbers', 'pwd-symbols', 'pwd-exclude-similar'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', generateSecurePassword);
      el.addEventListener('change', generateSecurePassword);
    }
  });
  generateSecurePassword();
});

function generateSecurePassword() {
  const length = parseInt(document.getElementById('pwd-length').value) || 16;
  const useLower = document.getElementById('pwd-lowercase').checked;
  const useUpper = document.getElementById('pwd-uppercase').checked;
  const useNumbers = document.getElementById('pwd-numbers').checked;
  const useSymbols = document.getElementById('pwd-symbols').checked;
  const excludeSimilar = document.getElementById('pwd-exclude-similar').checked;

  let lowercase = "abcdefghijklmnopqrstuvwxyz";
  let uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let numbers = "0123456789";
  let symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

  if (excludeSimilar) {
    // Remove: i, l, I, 1, o, 0, O, |, B, 8
    lowercase = lowercase.replace(/[ilo]/g, '');
    uppercase = uppercase.replace(/[IOB]/g, '');
    numbers = numbers.replace(/[018]/g, '');
    symbols = symbols.replace(/[|]/g, '');
  }

  let charset = "";
  if (useLower) charset += lowercase;
  if (useUpper) charset += uppercase;
  if (useNumbers) charset += numbers;
  if (useSymbols) charset += symbols;

  const outVal = document.getElementById('pwd-output-val');
  const bar = document.getElementById('pwd-strength-bar');
  const lbl = document.getElementById('pwd-strength-lbl');

  if (charset.length === 0) {
    if (outVal) outVal.innerText = "Select at least one character type";
    if (bar) bar.style.width = "0%";
    if (lbl) {
      lbl.innerText = "Select options";
      lbl.style.color = "var(--muted)";
    }
    return;
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  if (outVal) outVal.innerText = password;
  
  // Calculate Strength using entropy (L * log2(N))
  const poolSize = charset.length;
  const entropy = length * Math.log2(poolSize);

  if (bar && lbl) {
    if (entropy < 40) {
      bar.style.backgroundColor = "var(--accent-rose)";
      bar.style.width = "25%";
      lbl.innerText = "Weak 🪵";
      lbl.style.color = "var(--accent-rose)";
    } else if (entropy < 65) {
      bar.style.backgroundColor = "var(--orange)";
      bar.style.width = "50%";
      lbl.innerText = "Medium 🛡️";
      lbl.style.color = "var(--orange)";
    } else if (entropy < 90) {
      bar.style.backgroundColor = "var(--accent-cyan)";
      bar.style.width = "75%";
      lbl.innerText = "Strong 💎";
      lbl.style.color = "var(--accent-cyan)";
    } else {
      bar.style.backgroundColor = "var(--secondary)";
      bar.style.width = "100%";
      lbl.innerText = "Godlike 🌌";
      lbl.style.color = "var(--secondary)";
    }
  }
}

function copyPasswordResult(btn) {
  const val = document.getElementById('pwd-output-val').innerText;
  if (val && val !== "Select at least one character type" && val !== "Generating...") {
    window.copyToClipboard(val, btn);
  }
}

window.generateSecurePassword = generateSecurePassword;
window.copyPasswordResult = copyPasswordResult;
