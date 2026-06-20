/*
  Background Remover Logic
  Removes background colors locally using Canvas pixel calculations.
*/

let originalImage = null;
let originalFileName = 'image';

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('bg-dropzone');
  const fileInput = document.getElementById('bg-input');
  const canvas = document.getElementById('bg-canvas');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--secondary)';
      dropzone.style.background = 'rgba(13, 148, 136, 0.05)';
    });

    ['dragleave', 'dragend'].forEach(type => {
      dropzone.addEventListener(type, () => {
        dropzone.style.borderColor = 'var(--primary)';
        dropzone.style.background = 'rgba(124, 58, 237, 0.02)';
      });
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--primary)';
      dropzone.style.background = 'rgba(124, 58, 237, 0.02)';

      if (e.dataTransfer.files.length > 0) {
        loadBGImage(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        loadBGImage(e.target.files[0]);
      }
    });
  }

  if (canvas) {
    // Add canvas click event for picking color
    canvas.addEventListener('click', (e) => {
      if (!originalImage) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      // Create an offscreen canvas to sample the original un-keyed pixel
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = originalImage.naturalWidth;
      sampleCanvas.height = originalImage.naturalHeight;
      const sampleCtx = sampleCanvas.getContext('2d');
      sampleCtx.drawImage(originalImage, 0, 0);

      // We need to sample from the same coordinate ratio
      const sampleX = Math.floor((x / canvas.width) * originalImage.naturalWidth);
      const sampleY = Math.floor((y / canvas.height) * originalImage.naturalHeight);

      try {
        const pixelData = sampleCtx.getImageData(sampleX, sampleY, 1, 1).data;
        const hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        document.getElementById('bg-key-color').value = hex;
        processBGRemoval();
      } catch (err) {
        console.error("Sampling color failed", err);
      }
    });
  }
});

function rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

function loadBGImage(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }

  originalFileName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    originalImage = img;

    // Reset controls
    document.getElementById('bg-tolerance').value = 30;
    document.getElementById('bg-feather').value = 5;
    document.getElementById('bg-key-color').value = '#ffffff'; // default to white
    document.getElementById('bg-fill-type').value = 'transparent';
    toggleFillType();

    // Show panels
    document.getElementById('bg-controls').style.display = 'block';
    document.getElementById('bg-result-panel').style.display = 'block';

    // Set canvas dimensions
    const canvas = document.getElementById('bg-canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    processBGRemoval();
  };
}

function toggleFillType() {
  const fillType = document.getElementById('bg-fill-type').value;
  const pickerWrapper = document.getElementById('bg-solid-picker-wrapper');
  
  if (pickerWrapper) {
    pickerWrapper.style.display = fillType === 'solid' ? 'block' : 'none';
  }
  
  processBGRemoval();
}

function processBGRemoval() {
  if (!originalImage) return;

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw original image
  ctx.drawImage(originalImage, 0, 0, width, height);

  const keyHex = document.getElementById('bg-key-color').value;
  const keyRgb = hexToRgb(keyHex);

  const tolerance = parseInt(document.getElementById('bg-tolerance').value) || 30;
  const feather = parseInt(document.getElementById('bg-feather').value) || 5;
  const fillType = document.getElementById('bg-fill-type').value;

  const solidHex = document.getElementById('bg-solid-color').value;
  const solidRgb = hexToRgb(solidHex);

  // Update slider labels
  document.getElementById('bg-tolerance-lbl').innerText = `${tolerance}%`;
  document.getElementById('bg-feather-lbl').innerText = `${feather}px`;

  // Get image pixels
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Convert tolerance to metric range (0 to ~441.67)
  const maxDistance = 441.673; // sqrt(255^2 * 3)
  const toleranceLimit = (tolerance / 100) * maxDistance;
  const featherLimit = (feather / 100) * maxDistance;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue; // skip transparent pixels

    // Calculate Euclidean distance in RGB color space
    const rDiff = r - keyRgb.r;
    const gDiff = g - keyRgb.g;
    const bDiff = b - keyRgb.b;
    const dist = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

    let alpha = 255;

    if (dist <= toleranceLimit) {
      alpha = 0;
    } else if (dist < toleranceLimit + featherLimit && featherLimit > 0) {
      // Linear interpolation for smooth edges
      const ratio = (dist - toleranceLimit) / featherLimit;
      alpha = Math.round(ratio * 255);
    }

    // Blend transparency or solid color replacement
    if (fillType === 'solid') {
      // Alpha blend the original pixel with solid color
      const mixRatio = alpha / 255;
      data[i] = Math.round(r * mixRatio + solidRgb.r * (1 - mixRatio));
      data[i + 1] = Math.round(g * mixRatio + solidRgb.g * (1 - mixRatio));
      data[i + 2] = Math.round(b * mixRatio + solidRgb.b * (1 - mixRatio));
      data[i + 3] = 255; // solid output is fully opaque
    } else {
      // Simple alpha threshold mask
      data[i + 3] = Math.min(a, alpha);
    }
  }

  // Draw pixels back to canvas
  ctx.putImageData(imgData, 0, 0);
}

function downloadCutoutImage() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || !originalImage) return;

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${originalFileName}_cutout_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error("Cutout download failed", e);
    alert("Failed to download image. Security restriction or canvas error.");
  }
}

// Bind globals
window.toggleFillType = toggleFillType;
window.processBGRemoval = processBGRemoval;
window.downloadCutoutImage = downloadCutoutImage;
