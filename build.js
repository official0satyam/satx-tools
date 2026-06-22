/*
  SatX Tools - Static Site Generator Compiler
  Built using pure Node.js (no external dependencies) for maximum reliability and speed.
  Compiles pages, categories, tools, programmatic SEO variants, blogs, search indices, and sitemaps.
*/

const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURATION
// ==========================================
const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');
const REGISTRY_PATH = path.join(SRC_DIR, 'registry.json');

// Read master registry
const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
const SITE_URL = registry.site.url;

// Global list to store all generated URLs for sitemap
const generatedUrls = [];

// Visual representations matching the redesigned Sora/Inter theme
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

const categoryVisuals = {
  'calculators': {
    color: 'c-purple',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5h14v14H5z"></path><path d="M8 8h8M8 12h8M8 16h4"></path></svg>`
  },
  'student-tools': {
    color: 'c-pink',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v6H8z"></path><path d="M6 10h12v10H6z"></path><path d="M9 14h6M9 17h4"></path></svg>`
  },
  'developer-tools': {
    color: 'c-cyan',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="3"></rect><path d="M9 9h6M9 12h6M9 15h3"></path></svg>`
  }
};

// ==========================================
// MAIN COMPILE PROCESS
// ==========================================
function main() {
  console.log('🚀 Starting SatX Tools static compilation...');
  const startTime = Date.now();

  // 1. Prepare and clean dist folder
  cleanAndPrepareDirs();

  // 2. Load core templates
  const templates = loadTemplates();

  // 3. Generate Search Index JSON
  const searchIndexJson = generateSearchIndexJson();

  // 4. Copy static assets
  copyAssets();

  // 5. Compile core static pages (src/pages/*.html)
  compileStaticPages(templates, searchIndexJson);

  // 6. Compile Category Landing Pages
  compileCategoryPages(templates, searchIndexJson);

  // 7. Compile Blog section (Index & Individual articles)
  compileBlogSection(templates, searchIndexJson);

  // 8. Compile Tools & Programmatic SEO Pages
  compileToolsAndPseo(templates, searchIndexJson);

  // 9. Generate sitemap.xml & robots.txt
  generateSitemapAndRobots();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✨ Compilation successful! Generated ${generatedUrls.length} pages in ${duration} seconds.`);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Cleans the dist folder and recreates required directories
 */
function cleanAndPrepareDirs() {
  try {
    if (fs.existsSync(DIST_DIR)) {
      fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DIST_DIR);
  } catch (e) {
    console.log('⚠️ Notice: Dist folder locked by serving process. Rebuilding pages in-place.');
  }

  const subdirs = [
    path.join(DIST_DIR, 'assets'),
    path.join(DIST_DIR, 'assets', 'css'),
    path.join(DIST_DIR, 'assets', 'js'),
    path.join(DIST_DIR, 'assets', 'js', 'tools'),
    path.join(DIST_DIR, 'blog')
  ];

  subdirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Loads layout and sub-template files
 */
function loadTemplates() {
  return {
    layout: fs.readFileSync(path.join(SRC_DIR, 'templates', 'layout.html'), 'utf8'),
    head: fs.readFileSync(path.join(SRC_DIR, 'templates', 'head.html'), 'utf8'),
    header: fs.readFileSync(path.join(SRC_DIR, 'templates', 'header.html'), 'utf8'),
    footer: fs.readFileSync(path.join(SRC_DIR, 'templates', 'footer.html'), 'utf8')
  };
}

/**
 * Builds the search index array for client-side search lookup
 */
function generateSearchIndexJson() {
  const searchIndex = [];

  // Add category pages to search index
  registry.categories.forEach(cat => {
    searchIndex.push({
      name: `${cat.name} Category`,
      shortDescription: cat.description,
      url: `/${cat.slug}/`,
      keywords: [cat.name.toLowerCase(), 'category']
    });
  });

  // Add primary tools and their pSEO sub-pages
  registry.tools.forEach(tool => {
    const categories = Array.isArray(tool.category) ? tool.category : [tool.category];
    searchIndex.push({
      name: tool.name,
      shortDescription: tool.shortDescription,
      url: `/${tool.slug}/`,
      keywords: [tool.name.toLowerCase(), ...categories]
    });

    // Add programmatic pages to search
    if (tool.pseos && Array.isArray(tool.pseos)) {
      tool.pseos.forEach(pseo => {
        searchIndex.push({
          name: pseo.name,
          shortDescription: `${pseo.name} - dynamic interactive utility.`,
          url: `/${pseo.slug}/`,
          keywords: [pseo.name.toLowerCase(), tool.name.toLowerCase()]
        });
      });
    }
  });

  return JSON.stringify(searchIndex);
}

/**
 * Recursively copies assets (css, js, images) from src/assets to dist/assets
 */
function copyAssets() {
  const copyRecursive = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(childItem => {
        copyRecursive(path.join(src, childItem), path.join(dest, childItem));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };

  const srcAssets = path.join(SRC_DIR, 'assets');
  if (fs.existsSync(srcAssets)) {
    copyRecursive(srcAssets, path.join(DIST_DIR, 'assets'));
  }
}

/**
 * Parses JSON metadata block enclosed in <!-- ... --> at the top of page files
 */
function parseFileMetadata(fileContent) {
  const regex = /^\s*<!--([\s\S]*?)-->/;
  const match = fileContent.match(regex);
  if (match) {
    try {
      return {
        metadata: JSON.parse(match[1].trim()),
        contentOnly: fileContent.replace(regex, '').trim()
      };
    } catch (e) {
      console.warn('⚠️ Warning: Failed to parse metadata header as JSON.');
    }
  }
  return { metadata: {}, contentOnly: fileContent };
}

/**
 * Assembles head tags with specific SEO title, description, and canonical URL
 */
function compileHead(templates, searchIndexJson, title, description, canonicalUrl, additionalCss = '') {
  let head = templates.head;
  head = head.replace(/{{page_title}}/g, title);
  head = head.replace(/{{page_description}}/g, description);
  head = head.replace(/{{canonical_url}}/g, canonicalUrl);
  head = head.replace(/{{og_image}}/g, `${SITE_URL}/assets/images/og-default.png`);
  head = head.replace(/{{google_analytics_id}}/g, registry.site.googleAnalyticsId);
  head = head.replace(/{{search_index_json}}/g, searchIndexJson);
  head = head.replace(/{{additional_css}}/g, additionalCss);
  return head;
}

/**
 * Renders the full layout HTML by placing head, header, footer, content, and script tags
 */
function renderLayout(templates, headTags, content, additionalScripts = '') {
  let html = templates.layout;
  html = html.replace(/{{head_tags}}/g, headTags);
  html = html.replace(/{{header}}/g, templates.header);
  html = html.replace(/{{content}}/g, content);
  html = html.replace(/{{footer}}/g, templates.footer);
  html = html.replace(/{{additional_scripts}}/g, additionalScripts);
  return html;
}

/**
 * Writes static files, creating route subdirectories automatically for clean URLs
 */
function writeOutputFile(relativeRoute, htmlContent) {
  let targetPath;
  if (relativeRoute === 'index.html') {
    targetPath = path.join(DIST_DIR, 'index.html');
    generatedUrls.push('/');
  } else {
    // Convert e.g., 'about.html' -> dist/about.html or clean routes like 'calculators' -> dist/calculators/index.html
    if (relativeRoute.endsWith('.html')) {
      targetPath = path.join(DIST_DIR, relativeRoute);
      generatedUrls.push(`/${relativeRoute}`);
    } else {
      const dirPath = path.join(DIST_DIR, relativeRoute);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      targetPath = path.join(dirPath, 'index.html');
      generatedUrls.push(`/${relativeRoute}/`);
    }
  }
  fs.writeFileSync(targetPath, htmlContent, 'utf8');
}

// ==========================================
// CORE PAGES COMPILER
// ==========================================

function compileStaticPages(templates, searchIndexJson) {
  const pagesDir = path.join(SRC_DIR, 'pages');
  if (!fs.existsSync(pagesDir)) return;

  fs.readdirSync(pagesDir).forEach(file => {
    if (!file.endsWith('.html')) return;

    const filePath = path.join(pagesDir, file);
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const { metadata, contentOnly } = parseFileMetadata(rawContent);

    const title = metadata.title || registry.site.name;
    const description = metadata.description || registry.site.tagline;
    const slug = metadata.slug || file;
    const canonical = `${SITE_URL}/${slug === 'index.html' ? '' : slug}`;

    let content = contentOnly;
    if (file === 'index.html') {
      // Generate popular tools grid
      const popularTools = registry.tools.filter(t => t.popular);
      let popularHtml = `<div class="grid tools-grid">`;
      popularTools.forEach(t => {
        const visual = toolVisuals[t.slug] || { color: 'c-purple', svg: '' };
        popularHtml += `
          <article class="tool-card" onclick="location.href='/${t.slug}/'">
            <div class="top">
              <div class="icon-badge ${visual.color}">${visual.svg}</div>
              <div>
                <h3>${t.name}</h3>
                <p>${t.shortDescription}</p>
              </div>
            </div>
            <button class="open" onclick="event.stopPropagation(); location.href='/${t.slug}/'">Open Tool &rarr;</button>
          </article>
        `;
      });
      popularHtml += `</div>`;

      // Generate recently added grid (show all initial 5 tools)
      let recentHtml = `<div class="grid tools-grid">`;
      registry.tools.forEach(t => {
        const visual = toolVisuals[t.slug] || { color: 'c-purple', svg: '' };
        recentHtml += `
          <article class="tool-card" onclick="location.href='/${t.slug}/'">
            <div class="top">
              <div class="icon-badge ${visual.color}">${visual.svg}</div>
              <div>
                <h3>${t.name}</h3>
                <p>${t.shortDescription}</p>
              </div>
            </div>
            <button class="open" onclick="event.stopPropagation(); location.href='/${t.slug}/'">Open Tool &rarr;</button>
          </article>
        `;
      });
      recentHtml += `</div>`;

      // Generate categories grid
      let categoriesHtml = `<div class="grid category-grid">`;
      registry.categories.forEach(c => {
        const visual = categoryVisuals[c.slug] || { color: 'c-purple', svg: '' };
        const count = registry.tools.filter(t => t.category === c.id).length;
        categoriesHtml += `
          <a href="/${c.slug}/" class="category ${visual.color}">
            <div class="cat-top">
              <span>${count} tools</span>
              <div class="cat-icon">${visual.svg}</div>
            </div>
            <h3>${c.name}</h3>
          </a>
        `;
      });
      categoriesHtml += `</div>`;

      content = content.replace(/{{popular_tools_grid}}/g, popularHtml);
      content = content.replace(/{{recently_added_grid}}/g, recentHtml);
      content = content.replace(/{{categories_grid}}/g, categoriesHtml);
    }

    let additionalHeadTags = '';
    if (file === 'index.html') {
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": registry.site.name,
        "url": SITE_URL,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${SITE_URL}/?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
      additionalHeadTags = `\n<script type="application/ld+json">\n${JSON.stringify(websiteSchema, null, 2)}\n</script>`;
    }

    // Compile head and layout
    const headTags = compileHead(templates, searchIndexJson, title, description, canonical, additionalHeadTags);
    const finalHtml = renderLayout(templates, headTags, content);

    writeOutputFile(slug, finalHtml);
  });
}

// ==========================================
// CATEGORIES PAGE COMPILER
// ==========================================

function compileCategoryPages(templates, searchIndexJson) {
  registry.categories.forEach(category => {
    const canonical = `${SITE_URL}/${category.slug}/`;

    // Filter tools matching category
    const categoryTools = registry.tools.filter(t => 
      t.category === category.id || 
      (Array.isArray(t.category) && t.category.includes(category.id))
    );

    // Build Category Page HTML Content dynamically
    let categoryHtml = `
      <section class="section" style="margin-bottom: var(--space-xl);">
        <span class="section-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M4 8h16M4 16h16M8 4v16M16 4v16"/>
          </svg>
          Category
        </span>
        <h1 style="margin-top: var(--space-sm);">${category.name}</h1>
        <p style="font-size: 1.05rem; max-width: 800px; margin-bottom: var(--space-xl); color: var(--text-muted);">${category.description}</p>
        
        <div class="grid tools-grid">
    `;

    if (categoryTools.length === 0) {
      categoryHtml += `<p style="grid-column: 1/-1; color: var(--text-muted);">No tools added to this category yet. Tools will appear here shortly!</p>`;
    } else {
      categoryTools.forEach(tool => {
        const visual = toolVisuals[tool.slug] || { color: 'c-purple', svg: '' };
        categoryHtml += `
          <article class="tool-card" onclick="location.href='/${tool.slug}/'">
            <div class="top">
              <div class="icon-badge ${visual.color}">${visual.svg}</div>
              <div>
                <h3>${tool.name}</h3>
                <p>${tool.shortDescription}</p>
              </div>
            </div>
            <button class="open" onclick="event.stopPropagation(); location.href='/${tool.slug}/'">Open Tool &rarr;</button>
          </article>
        `;
      });
    }

    categoryHtml += `
        </div>
      </section>
    `;

    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": category.name,
      "description": category.description,
      "url": canonical
    };
    
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${SITE_URL}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": category.name,
          "item": canonical
        }
      ]
    };
    
    let additionalHeadTags = `\n<script type="application/ld+json">\n${JSON.stringify(collectionSchema, null, 2)}\n</script>`;
    additionalHeadTags += `\n<script type="application/ld+json">\n${JSON.stringify(breadcrumbSchema, null, 2)}\n</script>`;

    const headTags = compileHead(
      templates, 
      searchIndexJson, 
      category.name, 
      category.description, 
      canonical,
      additionalHeadTags
    );
    const finalHtml = renderLayout(templates, headTags, categoryHtml);

    writeOutputFile(category.slug, finalHtml);
  });
}

// ==========================================
// BLOG COMPILER
// ==========================================

function compileBlogSection(templates, searchIndexJson) {
  const blogDir = path.join(SRC_DIR, 'blog');
  if (!fs.existsSync(blogDir)) return;

  // Build blog index layout page dynamically
  const blogIndexCanonical = `${SITE_URL}/blog/`;
  let blogIndexHtml = `
    <section class="section" style="margin-bottom: var(--space-xl);">
      <span class="section-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M5 4h14v16H5z"/>
          <path d="M8 8h8M8 12h8M8 16h5"/>
        </svg>
        Blog Articles
      </span>
      <h1 style="margin-top: var(--space-sm);">SatX Tools Blog</h1>
      <p style="font-size: 1.05rem; max-width: 800px; margin-bottom: var(--space-xl); color: var(--text-muted);">Helpful guides, tutorials, and formulas supporting our tools list.</p>
      
      <div class="grid blog-grid">
  `;

  // Read blog HTML files from src/blog
  fs.readdirSync(blogDir).forEach(file => {
    if (!file.endsWith('.html') || file === 'index.html') return;

    const filePath = path.join(blogDir, file);
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const { metadata, contentOnly } = parseFileMetadata(rawContent);

    const title = metadata.title || 'Blog Article';
    const description = metadata.description || 'SatX Tools informational article.';
    const slug = metadata.slug || file.replace('.html', '');
    const date = metadata.date || '2026-06-16';
    const canonical = `${SITE_URL}/blog/${slug}/`;

    // Render individual blog post
    let articleHtml = `
      <article class="tool-article">
        <header style="margin-bottom: var(--space-xl); border-bottom: 2px solid var(--border-color); padding-bottom: var(--space-md);">
          <a href="/blog/" style="font-size: 0.9rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; margin-bottom: var(--space-md);">
            &larr; Back to Blog
          </a>
          <h1 style="margin-bottom: var(--space-sm);">${title}</h1>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Published on: <strong>${date}</strong></div>
        </header>
        <section class="blog-body">
          ${contentOnly}
        </section>
      </article>
    `;

    const blogPostingSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "datePublished": date,
      "url": canonical,
      "author": {
        "@type": "Organization",
        "name": registry.site.name
      },
      "publisher": {
        "@type": "Organization",
        "name": registry.site.name,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/assets/images/og-default.png`
        }
      }
    };
    
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${SITE_URL}/`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": `${SITE_URL}/blog/`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": title,
          "item": canonical
        }
      ]
    };
    
    let additionalHeadTags = `\n<script type="application/ld+json">\n${JSON.stringify(blogPostingSchema, null, 2)}\n</script>`;
    additionalHeadTags += `\n<script type="application/ld+json">\n${JSON.stringify(breadcrumbSchema, null, 2)}\n</script>`;

    const headTags = compileHead(templates, searchIndexJson, title, description, canonical, additionalHeadTags);
    const finalHtml = renderLayout(templates, headTags, articleHtml);

    writeOutputFile(`blog/${slug}`, finalHtml);

    // Add card to index page
    blogIndexHtml += `
      <article class="blog-card" onclick="location.href='/blog/${slug}/'" style="cursor: pointer;">
        <div class="blog-thumb">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 5H5v14h14z"></path>
            <path d="M8 9h8M8 13h8M8 17h5"></path>
          </svg>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px;">Published: ${date}</div>
        <h3>${title}</h3>
        <p>${description}</p>
      </article>
    `;
  });

  blogIndexHtml += `
      </div>
    </section>
  `;

  const indexHead = compileHead(
    templates, 
    searchIndexJson, 
    'Blog - Helpful Guides & Formulas', 
    'Guides and calculation formulas supporting SatX Tools.', 
    blogIndexCanonical
  );
  const indexHtml = renderLayout(templates, indexHead, blogIndexHtml);
  writeOutputFile('blog', indexHtml);
}

// ==========================================
// TOOLS & PROGRAMMATIC SEO COMPILER
// ==========================================

function compileToolsAndPseo(templates, searchIndexJson) {
  const toolsDir = path.join(SRC_DIR, 'tools');
  if (!fs.existsSync(toolsDir)) return;

  registry.tools.forEach(tool => {
    const toolSrcPath = path.join(toolsDir, tool.slug);
    if (!fs.existsSync(toolSrcPath)) {
      console.warn(`⚠️ Warning: Registry mentions tool "${tool.slug}" but folder does not exist.`);
      return;
    }

    // Load tool parts
    const uiSnippet = fs.readFileSync(path.join(toolSrcPath, 'index.html'), 'utf8');
    const scriptSnippet = fs.readFileSync(path.join(toolSrcPath, 'script.js'), 'utf8');
    const data = JSON.parse(fs.readFileSync(path.join(toolSrcPath, 'data.json'), 'utf8'));

    // Copy script snippet to public assets
    fs.writeFileSync(path.join(DIST_DIR, 'assets', 'js', 'tools', `${tool.slug}.js`), scriptSnippet, 'utf8');

    // Compile primary tool page
    compileIndividualToolPage(
      templates, 
      searchIndexJson, 
      tool, 
      uiSnippet, 
      data.primary, 
      tool.slug
    );

    // Compile Programmatic SEO sub-pages if configured
    if (tool.pseos && Array.isArray(tool.pseos) && data.programmatic) {
      tool.pseos.forEach(pseo => {
        const pseoCopy = data.programmatic[pseo.slug];
        if (!pseoCopy) {
          console.warn(`⚠️ Warning: Tool "${tool.slug}" registers pSEO page "${pseo.slug}" but unique content copy is missing in data.json.`);
          return;
        }
        
        compileIndividualToolPage(
          templates, 
          searchIndexJson, 
          tool, 
          uiSnippet, 
          pseoCopy, 
          pseo.slug
        );
      });
    }
  });
}

/**
 * Maps tools/categories to standard SoftwareApplication categories
 */
function getApplicationCategory(slug, category) {
  const mainCategory = Array.isArray(category) ? category[0] : category;
  if (slug === 'bmi-calculator') return 'HealthApplication';
  if (['emi-calculator', 'sip-calculator', 'compound-interest-calculator', 'currency-converter', 'gst-calculator', 'tip-calculator', 'discount-calculator'].includes(slug)) {
    return 'FinanceApplication';
  }
  if (mainCategory === 'developer-tools') return 'DeveloperApplication';
  if (mainCategory === 'student-tools') return 'EducationalApplication';
  return 'UtilityApplication';
}

/**
 * Builds a specific tool page (either primary or pSEO)
 */
function compileIndividualToolPage(templates, searchIndexJson, toolConfig, uiSnippet, seoCopy, pageSlug) {
  const canonical = `${SITE_URL}/${pageSlug}/`;

  // Build Related Tools list dynamically (excluding self)
  const relatedTools = registry.tools.filter(t => t.slug !== toolConfig.slug).slice(0, 3);
  let relatedHtml = '';
  relatedTools.forEach(r => {
    relatedHtml += `
      <a href="/${r.slug}/" class="related-card">
        <h4>${r.name}</h4>
        <p>${r.shortDescription}</p>
      </a>
    `;
  });

  // Build FAQs block
  let faqHtml = '';
  if (seoCopy.faqs && seoCopy.faqs.length > 0) {
    faqHtml = `
      <div class="faq-list">
        ${seoCopy.faqs.map(faq => `
          <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
            <h3 class="faq-question" itemprop="name">${faq.question}</h3>
            <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <div itemprop="text">${faq.answer}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Build Examples block
  let examplesHtml = '';
  if (seoCopy.examples && seoCopy.examples.length > 0) {
    examplesHtml = `
      <div style="margin-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-md);">
        ${seoCopy.examples.map(ex => `
          <div class="glass-card" style="padding: var(--space-md); border-color: rgba(255, 255, 255, 0.05);">
            <strong style="color: var(--text-main); display: block; margin-bottom: 4px;">${ex.title}</strong>
            <p style="font-size: 0.95rem; margin-bottom: 0;">${ex.description}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Inject variables into Tool Page structure
  let toolPageHtml = `
    <div class="tool-layout">
      <!-- Interactive Tool Element -->
      <div>
        <h1 style="margin-bottom: var(--space-sm);">${seoCopy.heading || toolConfig.name}</h1>
        <p style="font-size: 1.05rem; margin-bottom: var(--space-xl);">${seoCopy.description}</p>
        
        <div class="tool-workspace">
          ${uiSnippet}
        </div>
      </div>
      
      <!-- Side Navigation / Related category content -->
      <div class="glass-card category-sidebar-card" style="padding: var(--space-lg);">
        <button class="sidebar-toggle-btn" onclick="toggleSidebarMenu()" aria-expanded="false" style="width: 100%; display: none; justify-content: space-between; align-items: center; background: none; border: none; font-family: var(--font-header); font-weight: 800; font-size: 1.1rem; color: var(--text); padding: 0; cursor: pointer;">
          <span>All ${registry.categories.find(c => c.id === (Array.isArray(toolConfig.category) ? toolConfig.category[0] : toolConfig.category)).name}</span>
          <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform var(--transition-speed) ease;"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <h3 class="sidebar-desktop-title" style="margin-bottom: var(--space-md); font-size: 1.15rem;">All ${registry.categories.find(c => c.id === (Array.isArray(toolConfig.category) ? toolConfig.category[0] : toolConfig.category)).name}</h3>
        <div class="sidebar-content">
          <ul style="list-style: none;">
  `;

  // List tools in same category
  const siblingCategories = Array.isArray(toolConfig.category) ? toolConfig.category : [toolConfig.category];
  const siblingTools = registry.tools.filter(t => {
    const tCats = Array.isArray(t.category) ? t.category : [t.category];
    return tCats.some(cat => siblingCategories.includes(cat));
  });
  siblingTools.forEach(sib => {
    const isActive = sib.slug === toolConfig.slug;
    toolPageHtml += `
      <li style="margin-bottom: var(--space-sm);">
        <a href="/${sib.slug}/" style="font-weight: ${isActive ? '700' : '400'}; color: ${isActive ? 'var(--text-main)' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 6px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: ${isActive ? 'var(--primary)' : 'var(--text-light)'}">
            <polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          ${sib.name}
        </a>
      </li>
    `;
  });

  toolPageHtml += `
          </ul>
        </div>
      </div>
    </div>

    <!-- Long SEO explanations & articles -->
    <div class="tool-content">
      <article class="tool-article">
        <h2>${seoCopy.heading || toolConfig.name} Explanation</h2>
        <div style="font-size: 1.05rem; line-height: 1.7; color: var(--text-muted); margin-bottom: var(--space-xl);">
          ${seoCopy.seo_content}
        </div>

        ${examplesHtml ? `
          <h2>Practical Application Examples</h2>
          ${examplesHtml}
        ` : ''}

        ${faqHtml ? `
          <h2 style="margin-top: var(--space-xl);">Frequently Asked Questions (FAQ)</h2>
          <div itemscope itemtype="https://schema.org/FAQPage">
            ${faqHtml}
          </div>
        ` : ''}
      </article>
    </div>

    <!-- Related tools footer widget -->
    <div class="related-tools-section">
      <h3>Other Recommended Utilities</h3>
      <div class="related-grid">
        ${relatedHtml}
      </div>
    </div>
  `;

  const appCategory = getApplicationCategory(toolConfig.slug, toolConfig.category);
  
  // 1. WebApplication Schema
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": seoCopy.heading || toolConfig.name,
    "description": seoCopy.description,
    "url": canonical,
    "applicationCategory": appCategory,
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  // 2. BreadcrumbList Schema
  const mainCategory = Array.isArray(toolConfig.category) ? toolConfig.category[0] : toolConfig.category;
  const categoryName = registry.categories.find(c => c.id === mainCategory)?.name || "Tools";
  const categorySlug = registry.categories.find(c => c.id === mainCategory)?.slug || "";
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${SITE_URL}/`
      }
    ]
  };
  
  if (categorySlug) {
    breadcrumbSchema.itemListElement.push({
      "@type": "ListItem",
      "position": 2,
      "name": categoryName,
      "item": `${SITE_URL}/${categorySlug}/`
    });
    breadcrumbSchema.itemListElement.push({
      "@type": "ListItem",
      "position": 3,
      "name": seoCopy.heading || toolConfig.name,
      "item": canonical
    });
  } else {
    breadcrumbSchema.itemListElement.push({
      "@type": "ListItem",
      "position": 2,
      "name": seoCopy.heading || toolConfig.name,
      "item": canonical
    });
  }

  // 3. FAQPage Schema
  let faqSchema = null;
  if (seoCopy.faqs && seoCopy.faqs.length > 0) {
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": seoCopy.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }

  // Combine schemas into head block
  let additionalHeadTags = '<link rel="stylesheet" href="/assets/css/tools.css">';
  additionalHeadTags += `\n<script type="application/ld+json">\n${JSON.stringify(webAppSchema, null, 2)}\n</script>`;
  additionalHeadTags += `\n<script type="application/ld+json">\n${JSON.stringify(breadcrumbSchema, null, 2)}\n</script>`;
  if (faqSchema) {
    additionalHeadTags += `\n<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n</script>`;
  }

  // Compile head and layout
  const headTags = compileHead(
    templates, 
    searchIndexJson, 
    seoCopy.title, 
    seoCopy.description, 
    canonical, 
    additionalHeadTags
  );
  
  // Inject script loader
  const scriptTag = `<script src="/assets/js/tools/${toolConfig.slug}.js"></script>`;
  const finalHtml = renderLayout(templates, headTags, toolPageHtml, scriptTag);

  writeOutputFile(pageSlug, finalHtml);
}

// ==========================================
// SITEMAP & ROBOTS GENERATOR
// ==========================================

function generateSitemapAndRobots() {
  const today = new Date().toISOString().split('T')[0];

  // Sitemap.xml
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  generatedUrls.forEach(url => {
    const priority = url === '/' ? '1.0' : (url.includes('/blog/') ? '0.6' : '0.8');
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${SITE_URL}${url}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>monthly</changefreq>\n`;
    sitemap += `    <priority>${priority}</priority>\n`;
    sitemap += `  </url>\n`;
  });
  sitemap += `</urlset>\n`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf8');

  // Robots.txt
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robots, 'utf8');
}

// RUN GENERATOR
main();
