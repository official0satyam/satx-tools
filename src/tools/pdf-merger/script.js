/*
  PDF Tool Suite Logic
  Combines, extracts, splits, and compresses PDF files client-side using pdf-lib offline.
*/

let selectedFiles = []; // For merge
let splitFile = null;   // Single file object for split
let splitPdfDoc = null; // Loaded PDFLib document for split
let splitPdfBuffer = null; // Buffer array for split
let compFile = null;    // Single file object for compress
let compPdfBuffer = null; // Buffer array for compress
let pdfLibLoaded = false;
let currentObjectURL = null;
let currentPdfMode = 'merge'; // merge, split, compress

document.addEventListener('DOMContentLoaded', () => {
  // 1. Merge Dropzone Setup
  const dropzone = document.getElementById('pdf-dropzone');
  const fileInput = document.getElementById('pdf-input');

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
        handleFilesAdded(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFilesAdded(e.target.files);
      }
    });
  }

  // 2. Split Dropzone Setup
  const splitDropzone = document.getElementById('pdf-split-dropzone');
  const splitFileInput = document.getElementById('pdf-split-input');

  if (splitDropzone && splitFileInput) {
    splitDropzone.addEventListener('click', () => splitFileInput.click());
    splitDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      splitDropzone.style.borderColor = 'var(--secondary)';
      splitDropzone.style.background = 'rgba(13, 148, 136, 0.05)';
    });

    ['dragleave', 'dragend'].forEach(type => {
      splitDropzone.addEventListener(type, () => {
        splitDropzone.style.borderColor = 'var(--primary)';
        splitDropzone.style.background = 'rgba(124, 58, 237, 0.02)';
      });
    });

    splitDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      splitDropzone.style.borderColor = 'var(--primary)';
      splitDropzone.style.background = 'rgba(124, 58, 237, 0.02)';
      if (e.dataTransfer.files.length > 0) {
        handleSplitFileAdded(e.dataTransfer.files[0]);
      }
    });

    splitFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleSplitFileAdded(e.target.files[0]);
      }
    });
  }

  // 3. Compress Dropzone Setup
  const compDropzone = document.getElementById('pdf-comp-dropzone');
  const compFileInput = document.getElementById('pdf-comp-input');

  if (compDropzone && compFileInput) {
    compDropzone.addEventListener('click', () => compFileInput.click());
    compDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      compDropzone.style.borderColor = 'var(--secondary)';
      compDropzone.style.background = 'rgba(13, 148, 136, 0.05)';
    });

    ['dragleave', 'dragend'].forEach(type => {
      compDropzone.addEventListener(type, () => {
        compDropzone.style.borderColor = 'var(--primary)';
        compDropzone.style.background = 'rgba(124, 58, 237, 0.02)';
      });
    });

    compDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      compDropzone.style.borderColor = 'var(--primary)';
      compDropzone.style.background = 'rgba(124, 58, 237, 0.02)';
      if (e.dataTransfer.files.length > 0) {
        handleCompFileAdded(e.dataTransfer.files[0]);
      }
    });

    compFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleCompFileAdded(e.target.files[0]);
      }
    });
  }
});

function switchPdfTab(mode, btn) {
  currentPdfMode = mode;

  // Toggle active button
  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Hide all panels
  const panels = document.querySelectorAll('.pdf-mode-panel');
  panels.forEach(p => p.style.display = 'none');

  // Show active panel
  const activePanel = document.getElementById(`pdf-mode-${mode}`);
  if (activePanel) {
    activePanel.style.display = 'block';
  }

  // Hide unified results panel
  const resultPanel = document.getElementById('pdf-result-panel');
  if (resultPanel) {
    resultPanel.style.display = 'none';
  }
}

function loadPdfLib() {
  return new Promise((resolve, reject) => {
    if (window.PDFLib) {
      pdfLibLoaded = true;
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = '/assets/js/pdf-lib.min.js?v=2';
    script.onload = () => {
      if (window.PDFLib) {
        pdfLibLoaded = true;
        resolve();
      } else {
        reject(new Error("PDF library loaded, but the PDFLib global object is missing."));
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load PDF processing library. Please verify the asset path."));
    };
    document.head.appendChild(script);
  });
}

// ==========================================
// 1. MERGING LOGIC
// ==========================================
function handleFilesAdded(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type === 'application/pdf') {
      selectedFiles.push({
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        fileObject: file,
        name: file.name,
        size: file.size
      });
    }
  }
  
  document.getElementById('pdf-input').value = '';
  updateFileListUI();
}

function updateFileListUI() {
  const wrapper = document.getElementById('pdf-list-wrapper');
  const container = document.getElementById('pdf-file-list');
  const countEl = document.getElementById('pdf-count');
  const mergeBtn = document.getElementById('pdf-merge-btn');

  if (!wrapper || !container || !countEl || !mergeBtn) return;

  if (selectedFiles.length === 0) {
    wrapper.style.display = 'none';
    mergeBtn.disabled = true;
    return;
  }

  wrapper.style.display = 'block';
  countEl.innerText = selectedFiles.length;
  mergeBtn.disabled = selectedFiles.length < 2;

  let html = '';
  selectedFiles.forEach((item, idx) => {
    const sizeKB = (item.size / 1024).toFixed(1);
    html += `
      <div class="pdf-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 2px solid var(--border-color); border-radius: 12px; background: var(--card-bg);">
        <div style="display: flex; align-items: center; gap: 10px; overflow: hidden; margin-right: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" style="flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-color); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${sizeKB} KB</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 4px; flex-shrink: 0;">
          <button onclick="movePDFItem(${idx}, -1)" class="btn btn-secondary" style="padding: 0; width: 30px; height: 30px; min-height: unset; margin: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px;" ${idx === 0 ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button onclick="movePDFItem(${idx}, 1)" class="btn btn-secondary" style="padding: 0; width: 30px; height: 30px; min-height: unset; margin: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px;" ${idx === selectedFiles.length - 1 ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button onclick="deletePDFItem('${item.id}')" class="btn btn-secondary" style="padding: 0; width: 30px; height: 30px; min-height: unset; margin: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #ef4444; border-color: rgba(239,68,68,0.2);">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function movePDFItem(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= selectedFiles.length) return;
  
  const temp = selectedFiles[index];
  selectedFiles[index] = selectedFiles[targetIndex];
  selectedFiles[targetIndex] = temp;
  
  updateFileListUI();
}

function deletePDFItem(id) {
  selectedFiles = selectedFiles.filter(item => item.id !== id);
  updateFileListUI();
}

function clearPDFList() {
  selectedFiles = [];
  updateFileListUI();
  
  const resultPanel = document.getElementById('pdf-result-panel');
  if (resultPanel) resultPanel.style.display = 'none';

  if (currentObjectURL) {
    URL.revokeObjectURL(currentObjectURL);
    currentObjectURL = null;
  }
}

async function mergePDFs() {
  const mergeBtn = document.getElementById('pdf-merge-btn');
  const resultPanel = document.getElementById('pdf-result-panel');
  const resultMsg = document.getElementById('pdf-result-msg');
  const downloadLink = document.getElementById('pdf-download-link');
  const compStats = document.getElementById('pdf-compression-stats');

  if (selectedFiles.length < 2) return;

  const originalHtml = mergeBtn.innerHTML;
  mergeBtn.innerHTML = `
    <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
    Merging PDFs...
  `;
  mergeBtn.disabled = true;

  try {
    await loadPdfLib();

    // Create a new PDF
    const mergedPdf = await PDFLib.PDFDocument.create();

    // Iterate and read each PDF file
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i].fileObject;
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      const pageIndices = pdfDoc.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
      
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    // Save PDF
    const mergedPdfBytes = await mergedPdf.save();
    
    if (currentObjectURL) {
      URL.revokeObjectURL(currentObjectURL);
    }

    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    currentObjectURL = URL.createObjectURL(blob);

    downloadLink.href = currentObjectURL;
    downloadLink.download = `merged_${Date.now()}.pdf`;

    resultPanel.style.display = 'block';
    compStats.style.display = 'none';
    resultMsg.innerText = `Successfully merged ${selectedFiles.length} files into a single PDF document!`;
    resultPanel.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    alert(err.message || "An error occurred while merging your PDF files.");
  } finally {
    mergeBtn.innerHTML = originalHtml;
    mergeBtn.disabled = false;
  }
}

// ==========================================
// 2. SPLITTING LOGIC
// ==========================================
async function handleSplitFileAdded(file) {
  if (file.type !== 'application/pdf') {
    alert("Please select a valid PDF file.");
    return;
  }
  
  splitFile = file;
  document.getElementById('pdf-split-drop-txt').innerText = file.name;
  document.getElementById('pdf-split-drop-subtxt').innerText = `${(file.size / 1024).toFixed(1)} KB - Click to replace`;
  
  // Display loading page count
  document.getElementById('pdf-split-config').style.display = 'block';
  document.getElementById('pdf-split-info-name').innerText = file.name;
  document.getElementById('pdf-split-info-pages').innerText = 'Loading page count...';
  document.getElementById('pdf-split-btn').disabled = true;

  try {
    await loadPdfLib();
    splitPdfBuffer = await file.arrayBuffer();
    splitPdfDoc = await PDFLib.PDFDocument.load(splitPdfBuffer);
    const totalPages = splitPdfDoc.getPageCount();
    
    document.getElementById('pdf-split-info-pages').innerText = `${totalPages} pages`;
    document.getElementById('pdf-split-ranges').value = `1-${Math.min(3, totalPages)}`;
    document.getElementById('pdf-split-ranges').placeholder = `Max range is ${totalPages}`;
    document.getElementById('pdf-split-btn').disabled = false;
  } catch (err) {
    console.error(err);
    document.getElementById('pdf-split-info-pages').innerText = 'Failed to load PDF';
    alert("Failed to load PDF metadata. The file may be password-protected or corrupt.");
  }
}

function parsePageRanges(rangeStr, maxPages) {
  const pages = [];
  const parts = rangeStr.split(',');
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    if (part.includes('-')) {
      const bounds = part.split('-');
      const start = parseInt(bounds[0].trim());
      const end = parseInt(bounds[1].trim());
      if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
        throw new Error(`Invalid page range: ${part}`);
      }
      for (let i = start; i <= end; i++) {
        pages.push(i - 1); // convert to 0-indexed page number
      }
    } else {
      const pageNum = parseInt(part);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > maxPages) {
        throw new Error(`Invalid page number: ${part}`);
      }
      pages.push(pageNum - 1);
    }
  }
  return [...new Set(pages)];
}

async function splitPDF() {
  const splitBtn = document.getElementById('pdf-split-btn');
  const resultPanel = document.getElementById('pdf-result-panel');
  const resultMsg = document.getElementById('pdf-result-msg');
  const downloadLink = document.getElementById('pdf-download-link');
  const compStats = document.getElementById('pdf-compression-stats');

  if (!splitFile || !splitPdfDoc) return;

  const rangeInput = document.getElementById('pdf-split-ranges').value.trim();
  if (!rangeInput) {
    alert("Please enter page ranges to extract.");
    return;
  }

  const originalHtml = splitBtn.innerHTML;
  splitBtn.innerHTML = `
    <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
    Extracting Pages...
  `;
  splitBtn.disabled = true;

  try {
    const totalPages = splitPdfDoc.getPageCount();
    const pagesToCopy = parsePageRanges(rangeInput, totalPages);
    
    if (pagesToCopy.length === 0) {
      throw new Error("No valid pages were specified for extraction.");
    }

    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(splitPdfDoc, pagesToCopy);
    copiedPages.forEach(p => newPdf.addPage(p));

    const newPdfBytes = await newPdf.save();

    if (currentObjectURL) {
      URL.revokeObjectURL(currentObjectURL);
    }

    const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
    currentObjectURL = URL.createObjectURL(blob);

    downloadLink.href = currentObjectURL;
    downloadLink.download = `extracted_${Date.now()}.pdf`;

    resultPanel.style.display = 'block';
    compStats.style.display = 'none';
    resultMsg.innerText = `Extracted ${pagesToCopy.length} page(s) successfully! Ranges: ${rangeInput}`;
    resultPanel.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    alert(err.message || "An error occurred while splitting the PDF.");
  } finally {
    splitBtn.innerHTML = originalHtml;
    splitBtn.disabled = false;
  }
}

// ==========================================
// 3. COMPRESSION LOGIC
// ==========================================
async function handleCompFileAdded(file) {
  if (file.type !== 'application/pdf') {
    alert("Please select a valid PDF file.");
    return;
  }
  
  compFile = file;
  document.getElementById('pdf-comp-drop-txt').innerText = file.name;
  document.getElementById('pdf-comp-drop-subtxt').innerText = `${(file.size / 1024).toFixed(1)} KB - Click to replace`;
  
  document.getElementById('pdf-comp-config').style.display = 'block';
  document.getElementById('pdf-comp-info-name').innerText = file.name;
  document.getElementById('pdf-comp-info-size').innerText = `${(file.size / 1024).toFixed(1)} KB`;
  document.getElementById('pdf-comp-btn').disabled = false;
  
  try {
    await loadPdfLib();
    compPdfBuffer = await file.arrayBuffer();
  } catch (err) {
    console.error(err);
    alert("Failed to load PDF file buffer.");
  }
}

async function compressPDF() {
  const compBtn = document.getElementById('pdf-comp-btn');
  const resultPanel = document.getElementById('pdf-result-panel');
  const resultMsg = document.getElementById('pdf-result-msg');
  const downloadLink = document.getElementById('pdf-download-link');
  const compStats = document.getElementById('pdf-compression-stats');

  if (!compFile || !compPdfBuffer) return;

  const originalHtml = compBtn.innerHTML;
  compBtn.innerHTML = `
    <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
    Optimizing PDF...
  `;
  compBtn.disabled = true;

  try {
    const pdfDoc = await PDFLib.PDFDocument.load(compPdfBuffer);
    const pages = pdfDoc.getPageIndices();
    
    // Create new document (this strips unused metadata/orphan streams)
    const newPdf = await PDFLib.PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pages);
    copiedPages.forEach(p => newPdf.addPage(p));

    const level = document.getElementById('pdf-comp-level').value;
    let compBytes;
    if (level === 'high') {
      compBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        updateMetadata: false
      });
    } else {
      compBytes = await newPdf.save({
        useObjectStreams: false
      });
    }

    const origSize = compFile.size;
    const newSize = compBytes.length;
    const pctSaved = Math.max(0, ((origSize - newSize) / origSize) * 100).toFixed(1);

    if (currentObjectURL) {
      URL.revokeObjectURL(currentObjectURL);
    }

    const blob = new Blob([compBytes], { type: 'application/pdf' });
    currentObjectURL = URL.createObjectURL(blob);

    downloadLink.href = currentObjectURL;
    downloadLink.download = `optimized_${Date.now()}.pdf`;

    resultPanel.style.display = 'block';
    resultMsg.innerText = `PDF optimized and compressed successfully!`;
    
    // Set stats
    document.getElementById('comp-stat-orig').innerText = `${(origSize / 1024).toFixed(1)} KB`;
    document.getElementById('comp-stat-new').innerText = `${(newSize / 1024).toFixed(1)} KB`;
    document.getElementById('comp-stat-saved').innerText = `${pctSaved}%`;
    compStats.style.display = 'block';

    resultPanel.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    alert("An error occurred during compression: " + err.message);
  } finally {
    compBtn.innerHTML = originalHtml;
    compBtn.disabled = false;
  }
}

// Bind globals
window.switchPdfTab = switchPdfTab;
window.clearPDFList = clearPDFList;
window.movePDFItem = movePDFItem;
window.deletePDFItem = deletePDFItem;
window.mergePDFs = mergePDFs;
window.splitPDF = splitPDF;
window.compressPDF = compressPDF;
window.handleLogoUpload = handleLogoUpload;

