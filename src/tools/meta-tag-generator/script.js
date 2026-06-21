// Meta Tag Generator Script

function updateMetaTags() {
  const title = document.getElementById('meta-title').value.trim();
  const desc = document.getElementById('meta-desc').value.trim();
  const keywords = document.getElementById('meta-keywords').value.trim();
  const ogImage = document.getElementById('meta-og-image').value.trim();
  const ogType = document.getElementById('meta-og-type').value;
  const twitterCard = document.getElementById('meta-twitter-card').value;
  const robotsIndex = document.getElementById('meta-robots-index').value;
  const robotsFollow = document.getElementById('meta-robots-follow').value;
  const contentType = document.getElementById('meta-content-type').value;
  const lang = document.getElementById('meta-lang').value.trim() || 'English';

  // 1. Update Character Counters
  const titleLen = title.length;
  const descLen = desc.length;

  const titleCounter = document.getElementById('title-counter');
  const descCounter = document.getElementById('desc-counter');

  titleCounter.textContent = `${titleLen} / 60 chars`;
  descCounter.textContent = `${descLen} / 160 chars`;

  // Color warning for length thresholds
  if (titleLen > 60) {
    titleCounter.style.color = 'var(--c-pink, #ef4444)';
  } else if (titleLen > 50) {
    titleCounter.style.color = 'var(--c-orange, #f59e0b)';
  } else {
    titleCounter.style.color = 'var(--text-muted)';
  }

  if (descLen > 160) {
    descCounter.style.color = 'var(--c-pink, #ef4444)';
  } else if (descLen > 120) {
    descCounter.style.color = 'var(--c-orange, #f59e0b)';
  } else {
    descCounter.style.color = 'var(--text-muted)';
  }

  // 2. Update Google Search Preview
  const googleTitle = document.getElementById('google-preview-title');
  const googleDesc = document.getElementById('google-preview-desc');

  googleTitle.textContent = title || 'Please enter a site title';
  googleDesc.textContent = desc || 'Please enter a meta description so search engine crawlers can index and display a snippet summary for your site...';

  // 3. Update Social Card Preview
  const socialTitle = document.getElementById('social-preview-title');
  const socialDesc = document.getElementById('social-preview-desc');
  const socialImg = document.getElementById('social-preview-img');
  const imageContainer = document.getElementById('social-preview-image-container');

  socialTitle.textContent = title || 'Please enter a site title';
  socialDesc.textContent = desc || 'Please enter a meta description...';
  
  if (ogImage) {
    socialImg.src = ogImage;
    imageContainer.style.display = 'flex';
  } else {
    imageContainer.style.display = 'none';
  }

  // 4. Generate Output HTML Code
  let html = `<!-- HTML Meta Tags -->\n`;
  if (title) {
    html += `<title>${escapeHtml(title)}</title>\n`;
  }
  if (desc) {
    html += `<meta name="description" content="${escapeHtml(desc)}">\n`;
  }
  if (keywords) {
    html += `<meta name="keywords" content="${escapeHtml(keywords)}">\n`;
  }
  
  html += `\n<!-- Google / Search Engine Tags -->\n`;
  html += `<meta itemprop="name" content="${escapeHtml(title || 'Website Title')}">\n`;
  if (desc) {
    html += `<meta itemprop="description" content="${escapeHtml(desc)}">\n`;
  }
  if (ogImage) {
    html += `<meta itemprop="image" content="${escapeHtml(ogImage)}">\n`;
  }

  html += `\n<!-- Facebook Meta Tags -->\n`;
  html += `<meta property="og:url" content="https://yourwebsite.com">\n`;
  html += `<meta property="og:type" content="${escapeHtml(ogType)}">\n`;
  html += `<meta property="og:title" content="${escapeHtml(title || 'Website Title')}">\n`;
  if (desc) {
    html += `<meta property="og:description" content="${escapeHtml(desc)}">\n`;
  }
  if (ogImage) {
    html += `<meta property="og:image" content="${escapeHtml(ogImage)}">\n`;
  }

  html += `\n<!-- Twitter Meta Tags -->\n`;
  html += `<meta name="twitter:card" content="${escapeHtml(twitterCard)}">\n`;
  html += `<meta name="twitter:title" content="${escapeHtml(title || 'Website Title')}">\n`;
  if (desc) {
    html += `<meta name="twitter:description" content="${escapeHtml(desc)}">\n`;
  }
  if (ogImage) {
    html += `<meta name="twitter:image" content="${escapeHtml(ogImage)}">\n`;
  }

  html += `\n<!-- Advanced Settings -->\n`;
  html += `<meta name="robots" content="${escapeHtml(robotsIndex)}, ${escapeHtml(robotsFollow)}">\n`;
  html += `<meta http-equiv="Content-Type" content="${escapeHtml(contentType)}">\n`;
  html += `<meta name="language" content="${escapeHtml(lang)}">\n`;

  document.getElementById('meta-output-code').textContent = html;
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function copyMetaTags(btn) {
  const codeElement = document.getElementById('meta-output-code');
  navigator.clipboard.writeText(codeElement.textContent).then(() => {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--green);"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
    btn.classList.add('btn-success');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('btn-success');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

// Initial update on page load
document.addEventListener('DOMContentLoaded', () => {
  updateMetaTags();
});

// Run immediately as well in case script is loaded after DOMContentLoaded
updateMetaTags();
