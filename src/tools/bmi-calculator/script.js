let currentBmiUnit = 'metric';

function switchBmiTab(unit) {
  currentBmiUnit = unit;
  
  const btnMetric = document.getElementById('btn-bmi-metric');
  const btnImperial = document.getElementById('btn-bmi-imperial');
  const panelMetric = document.getElementById('panel-bmi-metric');
  const panelImperial = document.getElementById('panel-bmi-imperial');
  
  if (unit === 'metric') {
    btnMetric.classList.add('active');
    btnImperial.classList.remove('active');
    panelMetric.style.display = 'block';
    panelImperial.style.display = 'none';
  } else {
    btnMetric.classList.remove('active');
    btnImperial.classList.add('active');
    panelMetric.style.display = 'none';
    panelImperial.style.display = 'block';
  }
  calculateBMI();
}

function calculateBMI() {
  let weight = 0;
  let heightMeters = 0;
  let heightInches = 0;
  let bmi = 0;

  if (currentBmiUnit === 'metric') {
    const weightKg = parseFloat(document.getElementById('bmi-weight-metric').value) || 0;
    const heightCm = parseFloat(document.getElementById('bmi-height-metric').value) || 0;
    weight = weightKg;
    heightMeters = heightCm / 100;
    
    if (weightKg > 0 && heightMeters > 0) {
      bmi = weightKg / (heightMeters * heightMeters);
    }
  } else {
    const weightLbs = parseFloat(document.getElementById('bmi-weight-imperial').value) || 0;
    const heightFt = parseFloat(document.getElementById('bmi-height-ft').value) || 0;
    const heightIn = parseFloat(document.getElementById('bmi-height-in').value) || 0;
    
    heightInches = (heightFt * 12) + heightIn;
    weight = weightLbs;
    
    if (weightLbs > 0 && heightInches > 0) {
      bmi = (weightLbs / (heightInches * heightInches)) * 703;
    }
  }

  // Handle display calculations
  const bmiValEl = document.getElementById('bmi-val');
  const categoryEl = document.getElementById('bmi-category');
  const pointerEl = document.getElementById('bmi-pointer');
  const healthyRangeEl = document.getElementById('bmi-healthy-range');
  const adviceValEl = document.getElementById('bmi-advice-val');
  const resultPanel = document.querySelector('.result-panel');

  if (bmi === 0 || isNaN(bmi)) {
    bmiValEl.innerText = '--';
    categoryEl.innerText = 'Enter details above';
    categoryEl.style.color = 'var(--text-muted)';
    pointerEl.style.left = '0%';
    healthyRangeEl.innerText = '--';
    adviceValEl.innerText = 'Please input valid height and weight values.';
    return;
  }

  bmiValEl.innerText = bmi.toFixed(1);

  // Categorize
  let category = '';
  let color = '';
  let advice = '';

  if (bmi < 18.5) {
    category = 'Underweight ⚠️';
    color = '#f59e0b'; // Amber yellow
    resultPanel.className = 'result-panel warning';
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal Weight 💎';
    color = '#10b981'; // Green
    resultPanel.className = 'result-panel success';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight ⚠️';
    color = '#f97316'; // Orange
    resultPanel.className = 'result-panel warning';
  } else {
    category = 'Obese 🚨';
    color = '#ef4444'; // Red
    resultPanel.className = 'result-panel warning'; // Or danger if exists
  }

  categoryEl.innerText = category;
  categoryEl.style.color = color;

  // Move pointer on scale (Scale range: 15 to 40)
  const minScale = 15;
  const maxScale = 40;
  let pct = ((bmi - minScale) / (maxScale - minScale)) * 100;
  pct = Math.max(0, Math.min(100, pct));
  pointerEl.style.left = pct + '%';

  // Calculate healthy limits
  let minWeight = 0;
  let maxWeight = 0;

  if (currentBmiUnit === 'metric') {
    minWeight = 18.5 * (heightMeters * heightMeters);
    maxWeight = 24.9 * (heightMeters * heightMeters);
    healthyRangeEl.innerText = `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg`;

    if (weight < minWeight) {
      const diff = minWeight - weight;
      advice = `Gain ${diff.toFixed(1)} kg to reach healthy Normal weight.`;
    } else if (weight > maxWeight) {
      const diff = weight - maxWeight;
      advice = `Lose ${diff.toFixed(1)} kg to reach healthy Normal weight.`;
    } else {
      advice = 'You are in a healthy Normal weight range! Keep it up!';
    }
  } else {
    minWeight = (18.5 * (heightInches * heightInches)) / 703;
    maxWeight = (24.9 * (heightInches * heightInches)) / 703;
    healthyRangeEl.innerText = `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} lbs`;

    if (weight < minWeight) {
      const diff = minWeight - weight;
      advice = `Gain ${diff.toFixed(1)} lbs to reach healthy Normal weight.`;
    } else if (weight > maxWeight) {
      const diff = weight - maxWeight;
      advice = `Lose ${diff.toFixed(1)} lbs to reach healthy Normal weight.`;
    } else {
      advice = 'You are in a healthy Normal weight range! Keep it up!';
    }
  }

  adviceValEl.innerText = advice;
}

function copyBMIResult(btn) {
  const score = document.getElementById('bmi-val').innerText;
  const category = document.getElementById('bmi-category').innerText;
  const healthyRange = document.getElementById('bmi-healthy-range').innerText;
  const advice = document.getElementById('bmi-advice-val').innerText;
  
  const heightStr = currentBmiUnit === 'metric' 
    ? document.getElementById('bmi-height-metric').value + ' cm'
    : document.getElementById('bmi-height-ft').value + ' ft ' + document.getElementById('bmi-height-in').value + ' in';
  const weightStr = currentBmiUnit === 'metric'
    ? document.getElementById('bmi-weight-metric').value + ' kg'
    : document.getElementById('bmi-weight-imperial').value + ' lbs';

  const text = `Body Mass Index (BMI) Report:
- Height: ${heightStr} | Weight: ${weightStr}
- BMI Score: ${score}
- Health Category: ${category}
- Recommended Range: ${healthyRange}
- Goal Target: ${advice}

Calculated via SatX Tools.`;
  copyToClipboard(text, btn);
}

// Initial calculation on load
document.addEventListener('DOMContentLoaded', () => {
  calculateBMI();
});
if (document.getElementById('bmi-weight-metric')) {
  calculateBMI();
}
