function countText() {
  const val = document.getElementById('word-input').value || '';

  // Chars with spaces
  const charsWithSpaces = val.length;

  // Chars without spaces
  const charsNoSpaces = val.replace(/\s/g, '').length;

  // Words count
  const wordsArray = val.trim().split(/\s+/).filter(w => w.length > 0);
  const words = wordsArray.length;

  // Sentences count
  const sentences = val.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  // Paragraphs count
  const paragraphs = val.split(/\n+/).filter(p => p.trim().length > 0).length;

  // Update DOM stats
  document.getElementById('stat-words').innerText = words.toLocaleString();
  document.getElementById('stat-chars-spaces').innerText = charsWithSpaces.toLocaleString();
  document.getElementById('stat-chars-no-spaces').innerText = charsNoSpaces.toLocaleString();
  document.getElementById('stat-sentences').innerText = sentences.toLocaleString();
  document.getElementById('stat-paragraphs').innerText = paragraphs.toLocaleString();

  // Estimate times
  document.getElementById('stat-read-time').innerText = formatEstimateTime(words, 225);
  document.getElementById('stat-speak-time').innerText = formatEstimateTime(words, 130);
}

function formatEstimateTime(words, wpm) {
  if (words === 0) return '0s';
  const totalSeconds = Math.round((words / wpm) * 60);
  
  if (totalSeconds < 60) {
    return totalSeconds + 's';
  } else {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
}

function clearText() {
  const input = document.getElementById('word-input');
  if (input) {
    input.value = '';
    countText();
    input.focus();
  }
}

function copyInputText() {
  const val = document.getElementById('word-input').value || '';
  if (val.trim().length > 0) {
    navigator.clipboard.writeText(val).then(() => {
      alert('Text copied to clipboard!');
    });
  }
}

function copyWordStatsResult(btn) {
  const words = document.getElementById('stat-words').innerText;
  const charsSpaces = document.getElementById('stat-chars-spaces').innerText;
  const charsNoSpaces = document.getElementById('stat-chars-no-spaces').innerText;
  const sentences = document.getElementById('stat-sentences').innerText;
  const paragraphs = document.getElementById('stat-paragraphs').innerText;
  const reading = document.getElementById('stat-read-time').innerText;
  const speaking = document.getElementById('stat-speak-time').innerText;

  const text = `Document Statistics Report:
- Word Count: ${words}
- Characters (with spaces): ${charsSpaces}
- Characters (no spaces): ${charsNoSpaces}
- Total Sentences: ${sentences}
- Total Paragraphs: ${paragraphs}
- Estimated Reading Time: ${reading}
- Estimated Speaking Time: ${speaking}

Calculated via SatX Tools.`;
  copyToClipboard(text, btn);
}

// Initial calculation on load
document.addEventListener('DOMContentLoaded', () => {
  countText();
});
if (document.getElementById('word-input')) {
  countText();
}
