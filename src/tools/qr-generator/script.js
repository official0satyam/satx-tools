/*
  QR Code Generator Logic
  Encodes URLs, text, and Wi-Fi credentials into canvases offline.
*/

let currentQRType = 'url';
let qrLibLoaded = false;
let uploadedLogo = null;
let logoScale = 0.20;

document.addEventListener('DOMContentLoaded', () => {
  // Initial draw
  generateQR();
});

function setQRType(type, btn) {
  currentQRType = type;

  // Toggle active button
  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show corresponding form
  const forms = document.querySelectorAll('.qr-form-group');
  forms.forEach(f => f.style.display = 'none');

  const activeForm = document.getElementById(`qr-form-${type}`);
  if (activeForm) {
    activeForm.style.display = 'block';
  }

  generateQR();
}

function handleLogoUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      uploadedLogo = img;
      document.getElementById('qr-logo-clear').style.display = 'inline-flex';
      document.getElementById('logo-size-group').style.display = 'block';
      generateQR();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearLogo() {
  uploadedLogo = null;
  document.getElementById('qr-logo-upload').value = '';
  document.getElementById('qr-logo-clear').style.display = 'none';
  document.getElementById('logo-size-group').style.display = 'none';
  generateQR();
}

function updateLogoScale(slider) {
  logoScale = parseInt(slider.value) / 100;
  document.getElementById('qr-logo-size-lbl').innerText = slider.value + '%';
  generateQR();
}

function loadQRCodeLib() {
  return new Promise((resolve, reject) => {
    if (window.QRCode) {
      qrLibLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/assets/js/qrcode.min.js?v=2';
    script.onload = () => {
      if (window.QRCode) {
        qrLibLoaded = true;
        resolve();
      } else {
        reject(new Error("QR Code library loaded, but the QRCode constructor is not defined."));
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load QR Code generator library. Please verify the asset path."));
    };
    document.head.appendChild(script);
  });
}

async function generateQR() {
  const container = document.getElementById('qr-canvas-container');
  if (!container) return;

  try {
    await loadQRCodeLib();

    // Determine payload text
    let payload = '';

    if (currentQRType === 'url') {
      let url = document.getElementById('qr-url').value.trim();
      if (url.length === 0) {
        container.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">Please enter a URL</span>`;
        return;
      }
      // auto-prepend protocol if missing
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      payload = url;
    } else if (currentQRType === 'text') {
      const text = document.getElementById('qr-text').value;
      if (text.length === 0) {
        container.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">Please enter some text</span>`;
        return;
      }
      payload = text;
    } else if (currentQRType === 'wifi') {
      const ssid = document.getElementById('qr-wifi-ssid').value.trim();
      const pass = document.getElementById('qr-wifi-pass').value;
      const enc = document.getElementById('qr-wifi-enc').value;
      const hidden = document.getElementById('qr-wifi-hidden').checked;

      if (ssid.length === 0) {
        container.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-muted);">Please enter Wi-Fi network name (SSID)</span>`;
        return;
      }

      // WIFI:S:SSID;T:WPA;P:PASSWORD;H:false;;
      payload = `WIFI:S:${escapeWifiString(ssid)};T:${enc};P:${escapeWifiString(pass)};H:${hidden ? 'true' : 'false'};;`;
    }

    const fgColor = document.getElementById('qr-color-fg').value || '#7c3aed';
    const bgColor = document.getElementById('qr-color-bg').value || '#ffffff';
    const size = parseInt(document.getElementById('qr-size').value) || 512;
    const margin = parseInt(document.getElementById('qr-margin').value) || 0;
    const ecc = document.getElementById('qr-ecc').value || 'H';

    // Clear container
    container.innerHTML = '';

    // Create new QRCode
    new QRCode(container, {
      text: payload,
      width: size,
      height: size,
      colorDark: fgColor,
      colorLight: bgColor,
      correctLevel: QRCode.CorrectLevel[ecc]
    });

    const canvas = container.querySelector('canvas');
    const img = container.querySelector('img');

    // qrcodejs creates an img tag and canvas tag. We hide the img tag to keep canvas drawing control.
    if (img) img.style.display = 'none';

    if (canvas) {
      canvas.style.display = 'block';
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      
      // Apply visually quiet zone margin
      if (margin > 0) {
        canvas.style.padding = `${margin * 6}px`;
        canvas.style.background = bgColor;
      } else {
        canvas.style.padding = '0px';
      }

      // Draw uploaded logo in center
      if (uploadedLogo) {
        const ctx = canvas.getContext('2d');
        const logoWidth = canvas.width * logoScale;
        const logoHeight = canvas.height * logoScale;
        const x = (canvas.width - logoWidth) / 2;
        const y = (canvas.height - logoHeight) / 2;

        // Draw a solid background backing behind the logo to make it clean
        ctx.fillStyle = bgColor;
        const padding = 6;
        ctx.fillRect(x - padding, y - padding, logoWidth + padding * 2, logoHeight + padding * 2);
        ctx.strokeStyle = fgColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - padding, y - padding, logoWidth + padding * 2, logoHeight + padding * 2);

        // Draw image
        ctx.drawImage(uploadedLogo, x, y, logoWidth, logoHeight);
      }
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = `<span style="font-size: 0.85rem; color: #ef4444;">Error generating QR: ${err.message}</span>`;
  }
}

function escapeWifiString(val) {
  // Escape commas, colons, semi-colons and backslashes in SSID/Password
  return val.replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/:/g, '\\:')
            .replace(/,/g, '\\,')
            .replace(/"/g, '\\"');
}

function downloadQR(btn) {
  const container = document.getElementById('qr-canvas-container');
  const canvas = container.querySelector('canvas');
  if (!canvas) return;

  const format = document.getElementById('qr-format').value || 'png';
  const type = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const margin = parseInt(document.getElementById('qr-margin').value) || 0;

  try {
    let exportCanvas = canvas;

    // Draw the quiet zone margin inside the downloaded image file
    if (margin > 0) {
      const marginPx = margin * 8;
      exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width + marginPx * 2;
      exportCanvas.height = canvas.height + marginPx * 2;

      const ctx = exportCanvas.getContext('2d');
      const bgColor = document.getElementById('qr-color-bg').value || '#ffffff';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ctx.drawImage(canvas, marginPx, marginPx);
    }

    const dataUrl = exportCanvas.toDataURL(type, 1.0);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode_${currentQRType}_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error("Download failed", e);
    alert("Failed to download image. Security restriction or canvas error.");
  }
}

// Bind globals
window.setQRType = setQRType;
window.handleLogoUpload = handleLogoUpload;
window.clearLogo = clearLogo;
window.updateLogoScale = updateLogoScale;
window.generateQR = generateQR;
window.downloadQR = downloadQR;
