/*
  Unit Converter Logic
  Performs metric/imperial conversions for length, weight, temperature, and cooking volume.
*/

let currentUnitCategory = 'length';

const unitsData = {
  length: {
    base: 'm',
    defaultFrom: 'm',
    defaultTo: 'ft',
    units: {
      'm': { name: 'Meters (m)', factor: 1.0 },
      'km': { name: 'Kilometers (km)', factor: 1000.0 },
      'cm': { name: 'Centimeters (cm)', factor: 0.01 },
      'mm': { name: 'Millimeters (mm)', factor: 0.001 },
      'mi': { name: 'Miles (mi)', factor: 1609.344 },
      'yd': { name: 'Yards (yd)', factor: 0.9144 },
      'ft': { name: 'Feet (ft)', factor: 0.3048 },
      'in': { name: 'Inches (in)', factor: 0.0254 }
    }
  },
  weight: {
    base: 'kg',
    defaultFrom: 'kg',
    defaultTo: 'lb',
    units: {
      'kg': { name: 'Kilograms (kg)', factor: 1.0 },
      'g': { name: 'Grams (g)', factor: 0.001 },
      'mg': { name: 'Milligrams (mg)', factor: 0.000001 },
      'lb': { name: 'Pounds (lb)', factor: 0.45359237 },
      'oz': { name: 'Ounces (oz)', factor: 0.028349523 },
      'st': { name: 'Stones (st)', factor: 6.35029318 }
    }
  },
  temp: {
    base: 'C',
    defaultFrom: 'C',
    defaultTo: 'F',
    units: {
      'C': { name: 'Celsius (°C)', factor: 1 },
      'F': { name: 'Fahrenheit (°F)', factor: 1 },
      'K': { name: 'Kelvin (K)', factor: 1 }
    }
  },
  cooking: {
    base: 'ml',
    defaultFrom: 'cup',
    defaultTo: 'ml',
    units: {
      'ml': { name: 'Milliliters (ml)', factor: 1.0 },
      'L': { name: 'Liters (L)', factor: 1000.0 },
      'cup': { name: 'Cups (cup)', factor: 236.5882365 },
      'tbsp': { name: 'Tablespoons (tbsp)', factor: 14.786764781 },
      'tsp': { name: 'Teaspoons (tsp)', factor: 4.9289215937 },
      'fl_oz': { name: 'Fluid Ounces (fl oz)', factor: 29.573529562 },
      'pt': { name: 'Pints (pt)', factor: 473.176473 },
      'qt': { name: 'Quarts (qt)', factor: 946.352946 },
      'gal': { name: 'Gallons (gal)', factor: 3785.411784 }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  populateDropdowns();
  convertUnits();
});

function setUnitCategory(category, btn) {
  currentUnitCategory = category;

  // Toggle active button class
  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  populateDropdowns();
  convertUnits();
}

function populateDropdowns() {
  const fromSelect = document.getElementById('unit-from');
  const toSelect = document.getElementById('unit-to');
  if (!fromSelect || !toSelect) return;

  const data = unitsData[currentUnitCategory];
  
  let fromHtml = '';
  let toHtml = '';

  Object.keys(data.units).forEach(key => {
    const unit = data.units[key];
    const isSelFrom = key === data.defaultFrom ? 'selected' : '';
    const isSelTo = key === data.defaultTo ? 'selected' : '';
    fromHtml += `<option value="${key}" ${isSelFrom}>${unit.name}</option>`;
    toHtml += `<option value="${key}" ${isSelTo}>${unit.name}</option>`;
  });

  fromSelect.innerHTML = fromHtml;
  toSelect.innerHTML = toHtml;
}

function convertUnits() {
  const val = parseFloat(document.getElementById('unit-val').value);
  if (isNaN(val)) {
    document.getElementById('unit-output-text').innerText = '';
    document.getElementById('unit-output-val').innerText = '0';
    document.getElementById('unit-formula-text').innerText = 'Please enter a valid number';
    return;
  }

  const from = document.getElementById('unit-from').value;
  const to = document.getElementById('unit-to').value;

  const catData = unitsData[currentUnitCategory];
  const unitFrom = catData.units[from];
  const unitTo = catData.units[to];

  if (!unitFrom || !unitTo) return;

  let output = 0;
  let formula = '';

  if (currentUnitCategory === 'temp') {
    // Temperature has offset equations
    let celsius = val;
    if (from === 'F') {
      celsius = (val - 32) * 5 / 9;
    } else if (from === 'K') {
      celsius = val - 273.15;
    }

    if (to === 'C') {
      output = celsius;
      if (from === 'F') formula = `Formula: (°F - 32) × 5/9`;
      if (from === 'K') formula = `Formula: K - 273.15`;
    } else if (to === 'F') {
      output = celsius * 9 / 5 + 32;
      if (from === 'C') formula = `Formula: (°C × 9/5) + 32`;
      if (from === 'K') formula = `Formula: (K - 273.15) × 9/5 + 32`;
    } else if (to === 'K') {
      output = celsius + 273.15;
      if (from === 'C') formula = `Formula: °C + 273.15`;
      if (from === 'F') formula = `Formula: (°F - 32) × 5/9 + 273.15`;
    }
  } else {
    // Normal multiplicative units
    // Convert to base unit then to target
    const baseValue = val * unitFrom.factor;
    output = baseValue / unitTo.factor;

    const conversionFactor = unitFrom.factor / unitTo.factor;
    formula = `Formula: multiply the value by ${conversionFactor.toLocaleString(undefined, {maximumFractionDigits: 6})}`;
  }

  // Update labels
  const labelFrom = unitFrom.name.split(' (')[0];
  const labelTo = unitTo.name.split(' (')[0];
  
  document.getElementById('unit-output-text').innerText = `${val.toLocaleString()} ${labelFrom} =`;
  document.getElementById('unit-output-val').innerText = `${output.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})} ${labelTo}`;
  document.getElementById('unit-formula-text').innerText = formula;
}

function swapUnits() {
  const fromSelect = document.getElementById('unit-from');
  const toSelect = document.getElementById('unit-to');
  
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;

  convertUnits();
}

function copyUnitResult(btn) {
  const val = document.getElementById('unit-val').value;
  const outText = document.getElementById('unit-output-text').innerText;
  const outVal = document.getElementById('unit-output-val').innerText;
  const formula = document.getElementById('unit-formula-text').innerText;

  const text = `Unit Conversion summary:
- Input: ${outText}
- Conversion Result: ${outVal}
- ${formula}`;

  window.copyToClipboard(text, btn);
}

// Bind globals
window.setUnitCategory = setUnitCategory;
window.convertUnits = convertUnits;
window.swapUnits = swapUnits;
window.copyUnitResult = copyUnitResult;
