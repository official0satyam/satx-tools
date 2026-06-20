function updateCaseCounts() {
  const val = document.getElementById('case-input').value || '';
  const chars = val.length;
  const words = val.trim().split(/\s+/).filter(w => w.length > 0).length;

  document.getElementById('case-char-lbl').innerText = chars.toLocaleString();
  document.getElementById('case-word-lbl').innerText = words.toLocaleString();
}

function convertCase(type) {
  const input = document.getElementById('case-input');
  let val = input.value || '';
  if (val.trim().length === 0) return;

  let output = '';

  switch (type) {
    case 'lower':
      output = val.toLowerCase();
      break;
    case 'upper':
      output = val.toUpperCase();
      break;
    case 'sentence':
      // Lowercase all, then capitalize start of sentences
      output = val.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, m => m.toUpperCase());
      break;
    case 'title':
      output = toTitleCase(val);
      break;
    case 'camel':
      output = toCamelCase(val);
      break;
    case 'slug':
      output = toSlugCase(val);
      break;
    default:
      output = val;
  }

  input.value = output;
  updateCaseCounts();
}

function toTitleCase(str) {
  const excludes = ['a', 'an', 'the', 'and', 'but', 'or', 'to', 'of', 'for', 'by', 'in', 'on', 'at', 'with', 'from'];
  return str.toLowerCase().replace(/\b(\w+)\b/g, (match, word, index) => {
    if (index > 0 && excludes.includes(word)) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

function toCamelCase(str) {
  return str.toLowerCase()
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+(.)/g, (match, char) => char.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/^(.)/, char => char.toLowerCase());
}

function toSlugCase(str) {
  return str.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/[\s-_]+/g, '-');
}

function clearCaseText() {
  const input = document.getElementById('case-input');
  if (input) {
    input.value = '';
    updateCaseCounts();
    input.focus();
  }
}

function copyCaseText(btn) {
  const val = document.getElementById('case-input').value || '';
  if (val.trim().length > 0) {
    copyToClipboard(val, btn);
  }
}

// Bind counts input event
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('case-input');
  if (input) {
    input.addEventListener('input', updateCaseCounts);
    updateCaseCounts();
  }
});
if (document.getElementById('case-input')) {
  document.getElementById('case-input').addEventListener('input', updateCaseCounts);
  updateCaseCounts();
}
