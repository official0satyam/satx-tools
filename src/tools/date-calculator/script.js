let currentDateMode = 'diff';

function setDefaultDates() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate();

  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;

  const todayStr = `${yyyy}-${mm}-${dd}`;

  // End date default: Today + 30 days
  const future = new Date(today);
  future.setDate(today.getDate() + 30);
  const fY = future.getFullYear();
  let fM = future.getMonth() + 1;
  let fD = future.getDate();

  if (fM < 10) fM = '0' + fM;
  if (fD < 10) fD = '0' + fD;

  const futureStr = `${fY}-${fM}-${fD}`;

  const startInput = document.getElementById('date-start');
  const endInput = document.getElementById('date-end');
  const refInput = document.getElementById('date-ref');

  if (startInput) startInput.value = todayStr;
  if (endInput) endInput.value = futureStr;
  if (refInput) refInput.value = todayStr;
}

function switchDateTab(mode) {
  currentDateMode = mode;
  
  const btnDiff = document.getElementById('btn-date-diff');
  const btnAddSub = document.getElementById('btn-date-addsub');
  const panelDiff = document.getElementById('panel-date-diff');
  const panelAddSub = document.getElementById('panel-date-addsub');
  
  if (mode === 'diff') {
    btnDiff.classList.add('active');
    btnAddSub.classList.remove('active');
    panelDiff.style.display = 'block';
    panelAddSub.style.display = 'none';
  } else {
    btnDiff.classList.remove('active');
    btnAddSub.classList.add('active');
    panelDiff.style.display = 'none';
    panelAddSub.style.display = 'block';
  }
  calculateDate();
}

function calculateDate() {
  if (currentDateMode === 'diff') {
    const startVal = document.getElementById('date-start').value;
    const endVal = document.getElementById('date-end').value;

    if (!startVal || !endVal) {
      document.getElementById('date-diff-val').innerText = '--';
      document.getElementById('date-diff-breakdown').innerText = 'Select dates above';
      return;
    }

    const start = new Date(startVal);
    const end = new Date(endVal);

    // Absolute difference in days
    const diffMs = end - start;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const absDays = Math.abs(diffDays);

    document.getElementById('date-diff-val').innerText = absDays + (absDays === 1 ? ' Day' : ' Days');

    // Calendar breakdown logic
    let breakdown = '';
    
    // Express in weeks and days
    const weeks = Math.floor(absDays / 7);
    const remDays = absDays % 7;
    
    if (weeks > 0) {
      breakdown = `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`;
      if (remDays > 0) {
        breakdown += `, ${remDays} ${remDays === 1 ? 'Day' : 'Days'}`;
      }
    } else {
      breakdown = `${absDays} ${absDays === 1 ? 'Day' : 'Days'}`;
    }

    // If span exceeds ~30 days, append exact years/months/days breakdown
    if (absDays >= 28) {
      const date1 = diffDays >= 0 ? start : end;
      const date2 = diffDays >= 0 ? end : start;

      let yearsDiff = date2.getFullYear() - date1.getFullYear();
      let monthsDiff = date2.getMonth() - date1.getMonth();
      let daysDiff = date2.getDate() - date1.getDate();

      if (daysDiff < 0) {
        monthsDiff--;
        // get days in previous month
        const prevMonth = new Date(date2.getFullYear(), date2.getMonth(), 0).getDate();
        daysDiff += prevMonth;
      }
      if (monthsDiff < 0) {
        yearsDiff--;
        monthsDiff += 12;
      }

      let exactBreakdown = [];
      if (yearsDiff > 0) exactBreakdown.push(`${yearsDiff} ${yearsDiff === 1 ? 'Year' : 'Years'}`);
      if (monthsDiff > 0) exactBreakdown.push(`${monthsDiff} ${monthsDiff === 1 ? 'Month' : 'Months'}`);
      if (daysDiff > 0) exactBreakdown.push(`${daysDiff} ${daysDiff === 1 ? 'Day' : 'Days'}`);

      if (exactBreakdown.length > 0) {
        breakdown += ` (${exactBreakdown.join(', ')})`;
      }
    }

    if (diffDays < 0) {
      breakdown += ' ago';
    }

    document.getElementById('date-diff-breakdown').innerText = breakdown;

  } else {
    // Add/Subtract Days Mode
    const refVal = document.getElementById('date-ref').value;
    const op = document.getElementById('date-op').value;
    const years = parseInt(document.getElementById('date-val-years').value) || 0;
    const months = parseInt(document.getElementById('date-val-months').value) || 0;
    const weeks = parseInt(document.getElementById('date-val-weeks').value) || 0;
    const days = parseInt(document.getElementById('date-val-days').value) || 0;

    if (!refVal) {
      document.getElementById('date-addsub-val').innerText = '--';
      document.getElementById('date-addsub-desc').innerText = 'Select reference date';
      return;
    }

    const refDate = new Date(refVal);
    const target = new Date(refDate);
    const mult = op === 'add' ? 1 : -1;

    // Apply calendar mathematics
    target.setFullYear(target.getFullYear() + (years * mult));
    target.setMonth(target.getMonth() + (months * mult));
    target.setDate(target.getDate() + ((weeks * 7 + days) * mult));

    // Format target date: "Saturday, November 28, 2026"
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formatted = target.toLocaleDateString('en-US', options);

    document.getElementById('date-addsub-val').innerText = formatted;

    // Description text of offset
    let descParts = [];
    if (years > 0) descParts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) descParts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (weeks > 0) descParts.push(`${weeks} ${weeks === 1 ? 'week' : 'weeks'}`);
    if (days > 0) descParts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

    let desc = '';
    if (descParts.length > 0) {
      desc = `${op === 'add' ? 'Added' : 'Subtracted'} ${descParts.join(', ')}`;
    } else {
      desc = 'No offset duration applied';
    }
    document.getElementById('date-addsub-desc').innerText = desc;
  }
}

function copyDateResult(btn) {
  let text = '';
  
  if (currentDateMode === 'diff') {
    const start = document.getElementById('date-start').value;
    const end = document.getElementById('date-end').value;
    const total = document.getElementById('date-diff-val').innerText;
    const breakdown = document.getElementById('date-diff-breakdown').innerText;
    
    text = `Calendar Date Difference:
- Start Date: ${start}
- End Date: ${end}
- Total Difference: ${total}
- Breakdown: ${breakdown}

Calculated via SatX Tools.`;
  } else {
    const ref = document.getElementById('date-ref').value;
    const op = document.getElementById('date-op').value === 'add' ? 'Addition' : 'Subtraction';
    const desc = document.getElementById('date-addsub-desc').innerText;
    const result = document.getElementById('date-addsub-val').innerText;
    
    text = `Calendar Date Calculation:
- Reference Date: ${ref}
- Operation: ${op}
- Offset Applied: ${desc}
- Calculated Target Date: ${result}

Calculated via SatX Tools.`;
  }
  
  copyToClipboard(text, btn);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  setDefaultDates();
  calculateDate();
});
if (document.getElementById('date-start')) {
  setDefaultDates();
  calculateDate();
}
