/*
  Image Compressor & Resizer Logic
  Compresses and resizes image files client-side using the HTML5 Canvas API.
*/

let originalImage = null;
let originalFile = null;
let currentObjectURL = null;
let originalAspectRatio = 1.0;

document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('img-dropzone');
  const fileInput = document.getElementById('img-input');

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
        loadImage(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        loadImage(e.target.files[0]);
      }
    });
  }
});

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function loadImage(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }

  originalFile = file;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    originalImage = img;
    originalAspectRatio = img.naturalWidth / img.naturalHeight;

    // Reset controls
    document.getElementById('img-width').value = img.naturalWidth;
    document.getElementById('img-height').value = img.naturalHeight;
    document.getElementById('img-quality').value = 80;
    document.getElementById('img-quality-lbl').innerText = '80%';
    document.getElementById('img-format').value = 'original';

    // Show Panels
    document.getElementById('img-controls').style.display = 'block';
    document.getElementById('img-result-panel').style.display = 'block';

    // Update Original details
    document.getElementById('img-orig-size').innerText = formatBytes(file.size);
    document.getElementById('img-orig-dim').innerText = `${img.naturalWidth} x ${img.naturalHeight} px`;

    processImage();
  };
}

function onSizeInput(changedDimension) {
  if (!originalImage) return;

  const widthInput = document.getElementById('img-width');
  const heightInput = document.getElementById('img-height');
  const lockRatio = document.getElementById('img-lock-ratio').checked;

  let width = parseInt(widthInput.value) || 0;
  let height = parseInt(heightInput.value) || 0;

  if (lockRatio) {
    if (changedDimension === 'width' && width > 0) {
      height = Math.round(width / originalAspectRatio);
      heightInput.value = height;
    } else if (changedDimension === 'height' && height > 0) {
      width = Math.round(height * originalAspectRatio);
      widthInput.value = width;
    }
  }

  processImage();
}

function processImage() {
  if (!originalImage || !originalFile) return;

  const width = parseInt(document.getElementById('img-width').value) || originalImage.naturalWidth;
  const height = parseInt(document.getElementById('img-height').value) || originalImage.naturalHeight;
  const qualityVal = parseInt(document.getElementById('img-quality').value) || 80;

  document.getElementById('img-quality-lbl').innerText = `${qualityVal}%`;

  let mimeType = document.getElementById('img-format').value;
  if (mimeType === 'original') {
    mimeType = originalFile.type;
  }

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  // Fill background with white in case of transparent PNG converted to JPEG
  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(originalImage, 0, 0, width, height);

  const quality = qualityVal / 100;

  canvas.toBlob((blob) => {
    if (!blob) return;

    if (currentObjectURL) {
      URL.revokeObjectURL(currentObjectURL);
    }

    currentObjectURL = URL.createObjectURL(blob);

    // Update Compressed Details
    document.getElementById('img-comp-size').innerText = formatBytes(blob.size);
    document.getElementById('img-comp-dim').innerText = `${width} x ${height} px`;

    // Update reduction percentage
    const reduction = ((originalFile.size - blob.size) / originalFile.size * 100).toFixed(0);
    const reductionText = reduction > 0 ? `${reduction}%` : '0%';
    document.getElementById('img-reduction').innerText = reductionText;

    // Update Preview
    document.getElementById('img-preview').src = currentObjectURL;

  }, mimeType, quality);
}

function downloadCompressedImage() {
  if (!currentObjectURL || !originalFile) return;

  let format = document.getElementById('img-format').value;
  let ext = 'jpg';
  if (format === 'original') {
    format = originalFile.type;
  }

  if (format === 'image/png') ext = 'png';
  else if (format === 'image/webp') ext = 'webp';

  const a = document.createElement('a');
  a.href = currentObjectURL;
  a.download = `compressed_${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Bind globals
window.onSizeInput = onSizeInput;
window.processImage = processImage;
window.downloadCompressedImage = downloadCompressedImage;
