/*
  SatX Tools - Global JavaScript file
  Handles header search, mobile responsiveness, scroll reveal, desktop parallax, and client-side utilities.
*/

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initFavorites();
  initSearch();
  initMobileMenu();
  initScrollReveal();
  initParallax();
  initActiveNav();
  initPlaceholderCarousel();
  initMobileSearchOverlay();
  initSearchResultsPage();
  
  // Bind homepage hero search button click redirect
  const heroSearchBtn = document.getElementById('searchBtn');
  const heroInput = document.getElementById('hero-search');
  if (heroSearchBtn && heroInput) {
    heroSearchBtn.removeAttribute('onclick');
    heroSearchBtn.addEventListener('click', (e) => {
      const val = heroInput.value.trim();
      if (val.length > 0) {
        window.location.href = `/search/?q=${encodeURIComponent(val)}`;
      } else {
        const toolsSection = document.getElementById('tools');
        if (toolsSection) {
          toolsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }
});

function initSearch() {
  const configs = [
    { inputId: 'site-search', resultsId: 'search-results' },
    { inputId: 'hero-search', resultsId: 'hero-search-results' },
    { inputId: 'mobile-site-search', resultsId: 'mobile-search-results' }
  ];

  configs.forEach(cfg => {
    const input = document.getElementById(cfg.inputId);
    const results = document.getElementById(cfg.resultsId);
    
    if (!input || !results) return;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query.length > 0) {
          const overlay = document.getElementById('mobile-search-overlay');
          if (overlay) overlay.classList.remove('active');
          document.body.style.overflow = '';
          window.location.href = `/search/?q=${encodeURIComponent(query)}`;
        }
      }
    });

    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      if (query.length < 2) {
        results.innerHTML = '';
        results.classList.remove('active');
        return;
      }

      if (!window.searchIndex || !Array.isArray(window.searchIndex)) {
        return;
      }

      const matches = window.searchIndex.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.shortDescription.toLowerCase().includes(query) ||
        (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(query)))
      );

      renderSearchResults(matches, results);
    });

    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.innerHTML = '';
        results.classList.remove('active');
      }
    });
  });
}

/**
 * Renders search result items into the dropdown
 */
function renderSearchResults(items, container) {
  if (items.length === 0) {
    container.innerHTML = `<div class="search-no-results">No tools found matching your search.</div>`;
    container.classList.add('active');
    return;
  }

  const listHtml = items.slice(0, 6).map(item => `
    <a href="${item.url}" class="search-result-item">
      <div class="search-result-name">${item.name}</div>
      <div class="search-result-desc">${item.shortDescription}</div>
    </a>
  `).join('');

  container.innerHTML = listHtml;
  container.classList.add('active');
}

/**
 * Mobile Navigation Menu Toggler
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close');

  if (toggleBtn && drawer && backdrop) {
    function openDrawer() {
      drawer.classList.add('active');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove('active');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    
    const items = drawer.querySelectorAll('.drawer-item');
    items.forEach(item => item.addEventListener('click', closeDrawer));
  }
}

/**
 * Mobile Category Sidebar Accordion Menu Toggle
 */
function toggleSidebarMenu() {
  const content = document.querySelector('.sidebar-content');
  const btn = document.querySelector('.sidebar-toggle-btn');
  const icon = document.querySelector('.sidebar-toggle-btn .chevron-icon');
  
  if (content && btn) {
    const isExpanded = content.classList.toggle('active');
    btn.setAttribute('aria-expanded', isExpanded);
    if (icon) {
      icon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }
}
window.toggleSidebarMenu = toggleSidebarMenu;

/**
 * Scroll Reveal Animation Observer
 */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.08 });
  
  revealEls.forEach(el => observer.observe(el));
}

/**
 * Parallax Card Effect for Desktop Hero
 */
function initParallax() {
  const scene = document.getElementById('scene');
  if (!scene) return;

  let ticking = false;
  let clientX = 0;
  let clientY = 0;

  window.addEventListener('pointermove', (e) => {
    if (window.innerWidth <= 780) return;
    clientX = e.clientX;
    clientY = e.clientY;
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const x = (clientX / window.innerWidth) - 0.5;
        const y = (clientY / window.innerHeight) - 0.5;
        const items = scene.querySelectorAll('.parallax');
        items.forEach(el => {
          const depth = Number(el.dataset.depth || 10);
          const tx = x * depth * 0.85;
          const ty = y * depth * 0.85;
          el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Highlight Active Navigation Items
 */
function initActiveNav() {
  const path = window.location.pathname;
  
  const homeLink = document.getElementById('m-nav-home');
  const calcLink = document.getElementById('m-nav-calculators');
  const devLink = document.getElementById('m-nav-dev');
  const blogLink = document.getElementById('m-nav-blog');

  if (homeLink) homeLink.classList.remove('active');
  if (calcLink) calcLink.classList.remove('active');
  if (devLink) devLink.classList.remove('active');
  if (blogLink) blogLink.classList.remove('active');

  if (path === '/' || path === '/index.html' || path === '') {
    if (homeLink) homeLink.classList.add('active');
  } else if (path.includes('/calculators')) {
    if (calcLink) calcLink.classList.add('active');
  } else if (path.includes('/developer-tools')) {
    if (devLink) devLink.classList.add('active');
  } else if (path.includes('/blog')) {
    if (blogLink) blogLink.classList.add('active');
  }
}

/**
 * Global Copy to Clipboard Utility with visual button feedback
 * @param {string} text The text content to copy
 * @param {HTMLButtonElement} btnEl The button element clicked
 */
function copyToClipboard(text, btnEl) {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback(btnEl);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showCopyFeedback(btnEl);
  }).catch(err => {
    console.error('Async clipboard write failed', err);
  });
}

function showCopyFeedback(btnEl) {
  const originalText = btnEl.innerHTML;
  btnEl.classList.add('copied');
  btnEl.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
    Copied!
  `;
  
  setTimeout(() => {
    btnEl.classList.remove('copied');
    btnEl.innerHTML = originalText;
  }, 2000);
}

// Make copyToClipboard globally accessible
window.copyToClipboard = copyToClipboard;

/**
 * Slide-in placeholder carousel utility for the homepage search bar
 */
function initPlaceholderCarousel() {
  const carousel = document.getElementById('placeholder-carousel');
  const input = document.getElementById('hero-search');
  if (!carousel || !input) return;

  const slides = carousel.querySelectorAll('.placeholder-slide');
  if (slides.length === 0) return;

  let currentIdx = 0;
  let intervalId = null;

  function nextSlide() {
    slides[currentIdx].classList.remove('active');
    slides[currentIdx].classList.add('exiting');
    
    const prevIdx = currentIdx;
    setTimeout(() => {
      slides[prevIdx].classList.remove('exiting');
    }, 400);

    currentIdx = (currentIdx + 1) % slides.length;
    slides[currentIdx].classList.add('active');
  }

  function startCarousel() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(nextSlide, 3000);
  }

  function stopCarousel() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // Initial state
  startCarousel();

  // Hide carousel when input is active or has text
  function updateVisibility() {
    if (document.activeElement === input || input.value.length > 0) {
      carousel.style.opacity = '0';
      carousel.style.pointerEvents = 'none';
      stopCarousel();
    } else {
      carousel.style.opacity = '1';
      carousel.style.pointerEvents = 'none';
      startCarousel();
    }
  }

  input.addEventListener('focus', updateVisibility);
  input.addEventListener('blur', updateVisibility);
  input.addEventListener('input', updateVisibility);
  
  // Make clicking on the carousel focus the input
  carousel.addEventListener('click', () => {
    input.focus();
  });
}

/**
 * Mobile Full-page Search overlay open/close events
 */
function initMobileSearchOverlay() {
  const trigger = document.getElementById('mobile-search-trigger');
  const overlay = document.getElementById('mobile-search-overlay');
  const closeBtn = document.getElementById('mobile-search-close');
  const input = document.getElementById('mobile-site-search');
  
  if (!trigger || !overlay || !closeBtn || !input) return;
  
  trigger.addEventListener('click', () => {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 150);
  });
  
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    input.value = '';
    const results = document.getElementById('mobile-search-results');
    if (results) {
      results.innerHTML = '';
      results.classList.remove('active');
    }
  });
}

/**
 * Smart Currency Selection & Synchronization System
 */
window.detectLocalCurrency = function() {
  if (localStorage.getItem('satx-currency')) {
    return localStorage.getItem('satx-currency');
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Kolkata') || tz.includes('India')) return '₹';
    if (tz.includes('London')) return '£';
    if (tz.includes('Europe')) return '€';
    if (tz.includes('Tokyo') || tz.includes('Asia/Tokyo')) return '¥';
  } catch (e) {}
  return '$';
};

window.setGlobalCurrency = function(symbol) {
  localStorage.setItem('satx-currency', symbol);
  
  // Sync all dropdown selectors on the current page
  const dropdowns = document.querySelectorAll('.currency-select');
  dropdowns.forEach(select => {
    if (select.value !== symbol) {
      select.value = symbol;
    }
  });
  
  // Sync all currency symbol labels on the page
  const labels = document.querySelectorAll('.currency-symbol');
  labels.forEach(lbl => {
    lbl.innerText = symbol;
  });

  // Dispatch global event for calculators to run recalculate
  window.dispatchEvent(new CustomEvent('satx-currency-change', { detail: symbol }));
};

window.initCurrencySelector = function(recalcCallback) {
  const dropdowns = document.querySelectorAll('.currency-select');
  const initialCurrency = window.detectLocalCurrency();

  dropdowns.forEach(select => {
    select.value = initialCurrency;
    select.addEventListener('change', (e) => {
      window.setGlobalCurrency(e.target.value);
    });
  });

  const labels = document.querySelectorAll('.currency-symbol');
  labels.forEach(lbl => {
    lbl.innerText = initialCurrency;
  });

  window.addEventListener('satx-currency-change', (e) => {
    const symbol = e.detail;
    labels.forEach(lbl => {
      lbl.innerText = symbol;
    });
    if (recalcCallback) {
      recalcCallback(symbol);
    }
  });

  // Initial trigger
  if (recalcCallback) {
    recalcCallback(initialCurrency);
  }
};

/**
 * Dedicated search results page implementation
 */
const toolVisuals = {
  'percentage-calculator': {
    color: 'c-purple',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 5L5 19"></path><circle cx="8" cy="8" r="1.5"></circle><circle cx="16" cy="16" r="1.5"></circle></svg>`
  },
  'age-calculator': {
    color: 'c-pink',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v5l3 2"></path></svg>`
  },
  'gst-calculator': {
    color: 'c-green',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14"></path><path d="M7 7v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"></path><path d="M10 11h4M10 14h4"></path></svg>`
  },
  'discount-calculator': {
    color: 'c-indigo',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16l-6 10H4z"></path><path d="M8 11h.01M15 13h.01"></path></svg>`
  },
  'password-generator': {
    color: 'c-cyan',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="4"></rect><path d="M9 9h6M9 12h6M9 15h3"></path></svg>`
  },
  'emi-calculator': {
    color: 'c-purple',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="6" y1="15" x2="6.01" y2="15"></line><line x1="10" y1="15" x2="14" y2="15"></line></svg>`
  },
  'sip-calculator': {
    color: 'c-green',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
  },
  'bmi-calculator': {
    color: 'c-pink',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`
  },
  'date-calculator': {
    color: 'c-orange',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
  },
  'word-counter': {
    color: 'c-cyan',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>`
  },
  'case-converter': {
    color: 'c-indigo',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4M6 4v16M11 15h4M13 9v7M16 20h4M18 12v8"></path></svg>`
  },
  'json-formatter': {
    color: 'c-purple',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`
  },
  'tip-calculator': {
    color: 'c-indigo',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="12" y2="14"></line></svg>`
  },
  'compound-interest-calculator': {
    color: 'c-green',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M15 9H11.5a2.5 2.5 0 0 0 0 5H13a2.5 2.5 0 0 1 0 5H9"></path></svg>`
  },
  'currency-converter': {
    color: 'c-cyan',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`
  },
  'unit-converter': {
    color: 'c-orange',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect><line x1="6" y1="7" x2="6" y2="11"></line><line x1="10" y1="7" x2="10" y2="13"></line><line x1="14" y1="7" x2="14" y2="11"></line><line x1="18" y1="7" x2="18" y2="13"></line></svg>`
  },
  'pdf-merger': {
    color: 'c-pink',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`
  },
  'qr-generator': {
    color: 'c-purple',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><line x1="7" y1="7" x2="7.01" y2="7"></line><line x1="17" y1="7" x2="17.01" y2="7"></line><line x1="17" y1="17" x2="17.01" y2="17"></line><line x1="7" y1="17" x2="7.01" y2="17"></line></svg>`
  },
  'image-compressor': {
    color: 'c-indigo',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline><path d="M12 2v4M2 12h4M12 22v-4M22 12h-4"></path></svg>`
  },
  'bg-remover': {
    color: 'c-green',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path><circle cx="8.5" cy="10.5" r="1.5"></circle><path d="M11 16c2-3.33 3.5-3.33 5-5s2.5 1.67 4 4"></path></svg>`
  }
};

function initSearchResultsPage() {
  const container = document.getElementById('search-results-page-container');
  const input = document.getElementById('search-page-input');
  if (!container || !input) return;

  function performSearch(query) {
    query = query.toLowerCase().trim();
    if (query.length === 0) {
      container.innerHTML = '<p class="text-muted">Please enter a search query above.</p>';
      return;
    }

    if (!window.searchIndex || !Array.isArray(window.searchIndex)) {
      container.innerHTML = '<p class="text-muted">Loading tools index...</p>';
      return;
    }

    const matches = window.searchIndex.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.shortDescription.toLowerCase().includes(query) ||
      (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(query)))
    );

    renderSearchPageResults(matches, query);
  }

  function renderSearchPageResults(items, query) {
    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: var(--space-xl) var(--space-md);">
          <div style="font-size: 3rem; margin-bottom: var(--space-sm);">🔍</div>
          <h2>No tools found</h2>
          <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto;">
            We couldn't find any tools matching "<strong>${escapeHtml(query)}</strong>". Try searching for general terms like "calculator", "password", "PDF", or "converter".
          </p>
        </div>
      `;
      return;
    }

    let html = `
      <p style="color: var(--text-muted); margin-bottom: var(--space-lg);">
        Found <strong>${items.length}</strong> ${items.length === 1 ? 'tool' : 'tools'} matching "<strong>${escapeHtml(query)}</strong>":
      </p>
      <div class="grid tools-grid">
    `;

    items.forEach(item => {
      // Find matching visual if exists
      const slugMatch = item.url.match(/\/([^\/]+)\//);
      const slug = slugMatch ? slugMatch[1] : '';
      const visual = toolVisuals[slug] || { color: 'c-purple', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>` };

      html += `
        <article class="tool-card" data-slug="${slug}" onclick="location.href='${item.url}'">
          <div class="top">
            <div class="icon-badge ${visual.color}">${visual.svg}</div>
            <div>
              <h3>${highlightText(item.name, query)}</h3>
              <p>${highlightText(item.shortDescription, query)}</p>
            </div>
          </div>
          <button class="open" onclick="event.stopPropagation(); location.href='${item.url}'">Open Tool &rarr;</button>
        </article>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    if (typeof injectCardStarButtons === 'function') {
      injectCardStarButtons();
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

  function highlightText(text, query) {
    if (!query) return text;
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const reg = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(reg, '<mark style="background: rgba(124, 58, 237, 0.15); color: var(--primary); padding: 0 2px; border-radius: 4px; font-weight: bold;">$1</mark>');
  }

  // Get query from URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q') || '';
  input.value = initialQuery;
  
  // Perform search
  performSearch(initialQuery);

  // Bind input events
  input.addEventListener('input', (e) => {
    const val = e.target.value;
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?q=' + encodeURIComponent(val);
    window.history.replaceState({ path: newUrl }, '', newUrl);
    performSearch(val);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch(e.target.value);
    }
  });
}

function initDarkMode() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const sunIcon = toggleBtn.querySelector('.sun-icon');
  const moonIcon = toggleBtn.querySelector('.moon-icon');

  // Check stored theme or default to system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark-theme');
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
  } else {
    document.documentElement.classList.remove('dark-theme');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
  }

  toggleBtn.addEventListener('click', () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark-theme');
    if (isCurrentlyDark) {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  });
}

function updateFavoritesSection() {
  const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html';
  if (!isHomepage) return;

  const popularSection = document.getElementById('tools');
  if (!popularSection) return;

  let favSection = document.getElementById('favorites-section');
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (favorites.length === 0) {
    if (favSection) {
      favSection.remove();
    }
    return;
  }

  if (!favSection) {
    favSection = document.createElement('section');
    favSection.className = 'section reveal show';
    favSection.id = 'favorites-section';
    favSection.style.marginBottom = 'var(--space-xl)';
    popularSection.parentNode.insertBefore(favSection, popularSection);
  }

  let gridHtml = `
    <div class="section-head reveal show">
      <div>
        <span class="section-chip" style="background: rgba(245, 158, 11, 0.1); color: var(--orange); border-color: rgba(245, 158, 11, 0.2);">
          ⭐ My Favorite Tools
        </span>
        <p>Quick access to your most frequently used calculators and converters.</p>
      </div>
    </div>
    <div class="grid tools-grid">
  `;

  favorites.forEach(fav => {
    let baseSlug = fav.slug;
    if (!toolVisuals[baseSlug]) {
      if (baseSlug.includes('percentage')) baseSlug = 'percentage-calculator';
      else if (baseSlug.includes('age') || baseSlug.includes('old') || baseSlug.includes('birthday')) baseSlug = 'age-calculator';
      else if (baseSlug.includes('gst')) baseSlug = 'gst-calculator';
      else if (baseSlug.includes('discount') || baseSlug.includes('off') || baseSlug.includes('sale')) baseSlug = 'discount-calculator';
      else if (baseSlug.includes('password') || baseSlug.includes('string')) baseSlug = 'password-generator';
      else if (baseSlug.includes('emi') || baseSlug.includes('loan')) baseSlug = 'emi-calculator';
      else if (baseSlug.includes('sip') || baseSlug.includes('mutual') || baseSlug.includes('lumpsum')) baseSlug = 'sip-calculator';
      else if (baseSlug.includes('bmi') || baseSlug.includes('weight')) baseSlug = 'bmi-calculator';
      else if (baseSlug.includes('date') || baseSlug.includes('days')) baseSlug = 'date-calculator';
      else if (baseSlug.includes('word') || baseSlug.includes('character')) baseSlug = 'word-counter';
      else if (baseSlug.includes('case') || baseSlug.includes('uppercase') || baseSlug.includes('title')) baseSlug = 'case-converter';
      else if (baseSlug.includes('json')) baseSlug = 'json-formatter';
      else if (baseSlug.includes('tip') || baseSlug.includes('bill')) baseSlug = 'tip-calculator';
      else if (baseSlug.includes('compound') || baseSlug.includes('savings') || baseSlug.includes('interest')) baseSlug = 'compound-interest-calculator';
      else if (baseSlug.includes('currency') || baseSlug.includes('exchange')) baseSlug = 'currency-converter';
      else if (baseSlug.includes('unit') || baseSlug.includes('length')) baseSlug = 'unit-converter';
      else if (baseSlug.includes('pdf')) baseSlug = 'pdf-merger';
      else if (baseSlug.includes('qr') || baseSlug.includes('wifi')) baseSlug = 'qr-generator';
      else if (baseSlug.includes('compress') || baseSlug.includes('jpeg') || baseSlug.includes('png')) baseSlug = 'image-compressor';
      else if (baseSlug.includes('bg') || baseSlug.includes('background') || baseSlug.includes('transparent')) baseSlug = 'bg-remover';
    }

    const visual = toolVisuals[baseSlug] || { color: 'c-purple', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 5L5 19"></path><circle cx="8" cy="8" r="1.5"></circle><circle cx="16" cy="16" r="1.5"></circle></svg>` };
    
    gridHtml += `
      <article class="tool-card" data-slug="${fav.slug}" onclick="location.href='${fav.url}'">
        <div class="top">
          <div class="icon-badge ${visual.color}">${visual.svg}</div>
          <div>
            <h3>${fav.name}</h3>
            <p>${fav.desc || 'Quick dynamic calculator.'}</p>
          </div>
        </div>
        <button class="open" onclick="event.stopPropagation(); location.href='${fav.url}'">Open Tool &rarr;</button>
      </article>
    `;
  });

  gridHtml += `</div>`;
  favSection.innerHTML = gridHtml;
  
  injectCardStarButtons();
}

function injectCardStarButtons() {
  const cards = document.querySelectorAll('.tool-card');
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const goldStarColor = 'var(--orange)';
  
  cards.forEach(card => {
    const slug = card.getAttribute('data-slug');
    if (!slug) return;

    const isFavorited = favorites.some(f => f.slug === slug);
    let starBtn = card.querySelector('.card-star-btn');
    
    if (starBtn) {
      if (isFavorited) {
        starBtn.classList.add('active');
        starBtn.querySelector('svg').setAttribute('fill', goldStarColor);
        starBtn.querySelector('svg').setAttribute('stroke', goldStarColor);
        starBtn.setAttribute('title', 'Remove from Favorites');
      } else {
        starBtn.classList.remove('active');
        starBtn.querySelector('svg').setAttribute('fill', 'none');
        starBtn.querySelector('svg').setAttribute('stroke', 'currentColor');
        starBtn.setAttribute('title', 'Add to Favorites');
      }
      return;
    }

    starBtn = document.createElement('button');
    starBtn.className = `card-star-btn ${isFavorited ? 'active' : ''}`;
    starBtn.setAttribute('title', isFavorited ? 'Remove from Favorites' : 'Add to Favorites');
    
    starBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="${isFavorited ? goldStarColor : 'none'}" stroke="${isFavorited ? goldStarColor : 'currentColor'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `;

    card.appendChild(starBtn);

    starBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let favList = JSON.parse(localStorage.getItem('favorites') || '[]');
      const index = favList.findIndex(f => f.slug === slug);

      if (index > -1) {
        favList.splice(index, 1);
      } else {
        const toolName = card.querySelector('h3')?.innerText || slug;
        const toolDesc = card.querySelector('p')?.innerText || '';
        const onclickAttr = card.getAttribute('onclick');
        let url = `/${slug}/`;
        if (onclickAttr) {
          const match = onclickAttr.match(/location\.href='([^']+)'/);
          if (match) url = match[1];
        }
        favList.push({ slug, name: toolName, desc: toolDesc, url: url });
      }

      localStorage.setItem('favorites', JSON.stringify(favList));

      // Update all matching cards on the page
      const sameCards = document.querySelectorAll(`.tool-card[data-slug="${slug}"]`);
      sameCards.forEach(c => {
        const btn = c.querySelector('.card-star-btn');
        if (btn) {
          const active = index === -1;
          if (active) {
            btn.classList.add('active');
            btn.querySelector('svg').setAttribute('fill', goldStarColor);
            btn.querySelector('svg').setAttribute('stroke', goldStarColor);
            btn.setAttribute('title', 'Remove from Favorites');
          } else {
            btn.classList.remove('active');
            btn.querySelector('svg').setAttribute('fill', 'none');
            btn.querySelector('svg').setAttribute('stroke', 'currentColor');
            btn.setAttribute('title', 'Add to Favorites');
          }
        }
      });

      // Sync workspace page star button if present
      const workspaceStarBtn = document.querySelector('.tool-layout .star-btn');
      if (workspaceStarBtn) {
        if (index === -1) {
          workspaceStarBtn.querySelector('svg').setAttribute('fill', goldStarColor);
          workspaceStarBtn.querySelector('svg').setAttribute('stroke', goldStarColor);
          workspaceStarBtn.setAttribute('title', 'Remove from Favorites');
        } else {
          workspaceStarBtn.querySelector('svg').setAttribute('fill', 'none');
          workspaceStarBtn.querySelector('svg').setAttribute('stroke', 'currentColor');
          workspaceStarBtn.setAttribute('title', 'Add to Favorites');
        }
      }

      updateFavoritesSection();
    });
  });
}

function initFavorites() {
  const toolTitle = document.querySelector('.tool-layout h1');
  if (toolTitle) {
    const pathname = window.location.pathname;
    const slugMatch = pathname.match(/\/([^\/]+)\/?$/) || pathname.match(/\/([^\/]+)\/([^\/]+)\/?$/);
    const slug = slugMatch ? slugMatch[1] : '';
    
    if (slug) {
      const toolName = toolTitle.innerText;
      const toolDesc = document.querySelector('.tool-layout p')?.innerText || '';

      let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isFavorited = favorites.some(f => f.slug === slug);

      const starBtn = document.createElement('button');
      starBtn.className = 'btn btn-secondary star-btn';
      starBtn.style.cssText = 'padding: 0; width: 38px; height: 38px; min-height: unset; margin: 0 0 0 12px; display: inline-flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); border-color: rgba(245, 158, 11, 0.2); vertical-align: middle; cursor: pointer;';
      starBtn.setAttribute('title', isFavorited ? 'Remove from Favorites' : 'Add to Favorites');
      
      const goldStarColor = 'var(--orange)';
      const starIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${isFavorited ? goldStarColor : 'none'}" stroke="${isFavorited ? goldStarColor : 'currentColor'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="transition: all 0.2s ease;">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      `;
      starBtn.innerHTML = starIcon;

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: var(--space-sm); width: 100%;';
      toolTitle.parentNode.insertBefore(wrapper, toolTitle);
      wrapper.appendChild(toolTitle);
      wrapper.appendChild(starBtn);
      toolTitle.style.marginBottom = '0';

      starBtn.addEventListener('click', () => {
        let favList = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favList.findIndex(f => f.slug === slug);

        if (index > -1) {
          favList.splice(index, 1);
          starBtn.querySelector('svg').setAttribute('fill', 'none');
          starBtn.querySelector('svg').setAttribute('stroke', 'currentColor');
          starBtn.setAttribute('title', 'Add to Favorites');
        } else {
          favList.push({ slug, name: toolName, desc: toolDesc, url: pathname });
          starBtn.querySelector('svg').setAttribute('fill', goldStarColor);
          starBtn.querySelector('svg').setAttribute('stroke', goldStarColor);
          starBtn.setAttribute('title', 'Remove from Favorites');
        }

        localStorage.setItem('favorites', JSON.stringify(favList));
        
        const sameCards = document.querySelectorAll(`.tool-card[data-slug="${slug}"]`);
        sameCards.forEach(c => {
          const btn = c.querySelector('.card-star-btn');
          if (btn) {
            if (index > -1) {
              btn.classList.remove('active');
              btn.querySelector('svg').setAttribute('fill', 'none');
              btn.querySelector('svg').setAttribute('stroke', 'currentColor');
              btn.setAttribute('title', 'Add to Favorites');
            } else {
              btn.classList.add('active');
              btn.querySelector('svg').setAttribute('fill', goldStarColor);
              btn.querySelector('svg').setAttribute('stroke', goldStarColor);
              btn.setAttribute('title', 'Remove from Favorites');
            }
          }
        });

        updateFavoritesSection();
      });
    }
  }

  updateFavoritesSection();
  injectCardStarButtons();
}
