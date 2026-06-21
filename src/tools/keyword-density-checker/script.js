// Keyword Density Checker Script

let currentTab = 1; // 1, 2, or 3 words

const stopWords = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

function setKDTab(tabNumber) {
  currentTab = tabNumber;
  
  // Update UI tabs
  document.getElementById('kd-tab-1').classList.remove('active');
  document.getElementById('kd-tab-2').classList.remove('active');
  document.getElementById('kd-tab-3').classList.remove('active');
  document.getElementById(`kd-tab-${tabNumber}`).classList.add('active');
  
  analyzeKeywordDensity();
}

function analyzeKeywordDensity() {
  const text = document.getElementById('kd-text').value;
  const ignoreStop = document.getElementById('kd-ignore-stopwords').checked;
  const caseSensitive = document.getElementById('kd-case-sensitive').checked;

  const tableBody = document.getElementById('kd-table-body');
  const emptyMsg = document.getElementById('kd-empty-msg');
  const stuffingAlert = document.getElementById('kd-stuffing-warning');

  // Clear previous output
  tableBody.innerHTML = '';
  stuffingAlert.style.display = 'none';

  if (!text.trim()) {
    document.getElementById('kd-stat-words').textContent = '0';
    document.getElementById('kd-stat-chars').textContent = '0';
    document.getElementById('kd-stat-unique').textContent = '0';
    document.getElementById('kd-stat-time').textContent = '0s';
    emptyMsg.style.display = 'block';
    return;
  }

  // 1. Clean and tokenize text
  // Replace punctuation with spaces, keeping alphanumeric and apostrophes/hyphens inside words
  let cleanText = text;
  if (!caseSensitive) {
    cleanText = cleanText.toLowerCase();
  }

  const words = cleanText
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^[-']+|[-']+$/g, '').trim()) // trim hanging hyphens/apostrophes
    .filter(w => w.length > 0);

  const totalWordsCount = words.length;
  const charsCount = text.length;

  // Reading time (average 200 words per minute)
  const readingTimeSeconds = Math.max(1, Math.round((totalWordsCount / 200) * 60));
  
  // Set basic statistics
  document.getElementById('kd-stat-words').textContent = totalWordsCount;
  document.getElementById('kd-stat-chars').textContent = charsCount;
  document.getElementById('kd-stat-time').textContent = readingTimeSeconds >= 60 
    ? `${Math.floor(readingTimeSeconds / 60)}m ${readingTimeSeconds % 60}s` 
    : `${readingTimeSeconds}s`;

  if (totalWordsCount === 0) {
    document.getElementById('kd-stat-unique').textContent = '0';
    emptyMsg.style.display = 'block';
    return;
  }

  // Count frequencies
  const frequencies = {};
  let totalPhrasesAnalyzed = 0;

  if (currentTab === 1) {
    // 1-Word Phrases
    words.forEach(w => {
      // Check stop words
      if (ignoreStop && stopWords.has(w.toLowerCase())) {
        return;
      }
      frequencies[w] = (frequencies[w] || 0) + 1;
      totalPhrasesAnalyzed++;
    });
  } else if (currentTab === 2) {
    // 2-Word Phrases
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];
      
      // If ignore stop words, skip if either is a stop word
      if (ignoreStop && (stopWords.has(w1.toLowerCase()) || stopWords.has(w2.toLowerCase()))) {
        continue;
      }
      
      const phrase = `${w1} ${w2}`;
      frequencies[phrase] = (frequencies[phrase] || 0) + 1;
      totalPhrasesAnalyzed++;
    }
  } else if (currentTab === 3) {
    // 3-Word Phrases
    for (let i = 0; i < words.length - 2; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];
      const w3 = words[i + 2];
      
      // Skip if any is a stop word
      if (ignoreStop && (stopWords.has(w1.toLowerCase()) || stopWords.has(w2.toLowerCase()) || stopWords.has(w3.toLowerCase()))) {
        continue;
      }
      
      const phrase = `${w1} ${w2} ${w3}`;
      frequencies[phrase] = (frequencies[phrase] || 0) + 1;
      totalPhrasesAnalyzed++;
    }
  }

  // Unique words count
  const uniqueCount = Object.keys(frequencies).length;
  if (currentTab === 1) {
    document.getElementById('kd-stat-unique').textContent = uniqueCount;
  }

  // Sort keywords
  const sortedKeywords = Object.entries(frequencies)
    .map(([keyword, count]) => {
      const density = ((count / totalWordsCount) * 100).toFixed(2);
      return { keyword, count, density: parseFloat(density) };
    })
    .sort((a, b) => b.count - a.count || b.density - a.density);

  if (sortedKeywords.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  // Limit to top 15 results
  const topKeywords = sortedKeywords.slice(0, 15);
  let hasStuffing = false;

  topKeywords.forEach(item => {
    if (item.density > 3.5) {
      hasStuffing = true;
    }

    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--border-color)';
    row.innerHTML = `
      <td style="padding: var(--space-sm) var(--space-md); font-weight: 500; color: var(--text-main); word-break: break-all;">${escapeHtml(item.keyword)}</td>
      <td style="padding: var(--space-sm) var(--space-md); text-align: center; color: var(--text-body); font-weight: 600;">${item.count}</td>
      <td style="padding: var(--space-sm) var(--space-md); text-align: center;">
        <span class="badge" style="background: ${item.density > 3.5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; color: ${item.density > 3.5 ? 'var(--c-pink, #ef4444)' : 'var(--c-green, #10b981)'}; font-weight: 700; padding: 4px 8px; border-radius: 6px;">
          ${item.density}%
        </span>
      </td>
    `;
    tableBody.appendChild(row);
  });

  if (hasStuffing) {
    stuffingAlert.style.display = 'block';
  }
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Run initial analysis on DOM load
document.addEventListener('DOMContentLoaded', () => {
  analyzeKeywordDensity();
});

// Run immediately too
analyzeKeywordDensity();
