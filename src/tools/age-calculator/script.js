/*
  Age Calculator Logic
  Processes calculations client-side in real-time.
*/

document.addEventListener('DOMContentLoaded', () => {
  const dobInput = document.getElementById('age-birthdate');
  if (dobInput) {
    dobInput.addEventListener('input', calculateAge);
    // Set max date to today
    const today = new Date().toISOString().split('T')[0];
    dobInput.setAttribute('max', today);
  }
  calculateAge();
});

function calculateAge() {
  const birthValue = document.getElementById('age-birthdate').value;
  const resVal = document.getElementById('age-output-val');
  const countVal = document.getElementById('birthday-countdown-val');
  const weekdayLbl = document.getElementById('birthday-weekday-lbl');
  
  const statMonths = document.getElementById('stat-months');
  const statWeeks = document.getElementById('stat-weeks');
  const statDays = document.getElementById('stat-days');
  const statHours = document.getElementById('stat-hours');
  const statSleep = document.getElementById('stat-sleep');
  const statDog = document.getElementById('stat-dog');
  const statHeart = document.getElementById('stat-heart');

  if (!birthValue) {
    if (resVal) resVal.textContent = '--';
    if (countVal) countVal.textContent = '--';
    if (weekdayLbl) weekdayLbl.textContent = '--';
    return;
  }

  const birthday = new Date(birthValue);
  const today = new Date();

  // Reset time to zero to avoid time zone shifts
  birthday.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  if (birthday > today) {
    if (resVal) resVal.textContent = 'Date is in the future';
    if (countVal) countVal.textContent = '--';
    if (weekdayLbl) weekdayLbl.textContent = '--';
    return;
  }

  // 1. Calculate Age
  let ageYears = today.getFullYear() - birthday.getFullYear();
  let ageMonths = today.getMonth() - birthday.getMonth();
  let ageDays = today.getDate() - birthday.getDate();

  if (ageDays < 0) {
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    ageDays += prevMonth.getDate();
    ageMonths--;
  }

  if (ageMonths < 0) {
    ageYears--;
    ageMonths += 12;
  }

  const formattedAge = `${ageYears} Yrs, ${ageMonths} Mos, ${ageDays} Days`;
  if (resVal) resVal.textContent = formattedAge;

  // 2. Calculate Next Birthday Countdown
  const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (today > nextBirthday) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffNext = nextBirthday - today;
  const daysRemaining = Math.ceil(diffNext / (1000 * 60 * 60 * 24));

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const nextWeekday = weekdays[nextBirthday.getDay()];

  if (birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate()) {
    if (countVal) countVal.textContent = "Happy Birthday! 🎂";
    if (weekdayLbl) weekdayLbl.textContent = "Today is your special day!";
  } else {
    let nextMonths = nextBirthday.getMonth() - today.getMonth();
    let nextDays = nextBirthday.getDate() - today.getDate();

    if (nextDays < 0) {
      const prevMonth = new Date(nextBirthday.getFullYear(), nextBirthday.getMonth(), 0);
      nextDays += prevMonth.getDate();
      nextMonths--;
    }
    if (nextMonths < 0) {
      nextMonths += 12;
    }

    let countdownText = "";
    if (nextMonths > 0) {
      countdownText += `${nextMonths} Month${nextMonths > 1 ? 's' : ''}, `;
    }
    countdownText += `${nextDays} Day${nextDays > 1 ? 's' : ''} remaining`;
    
    if (countVal) countVal.textContent = countdownText;
    if (weekdayLbl) weekdayLbl.textContent = `Your next birthday will be on a ${nextWeekday}!`;
  }

  // 3. Detailed Stats
  const diffTime = Math.abs(today - birthday);
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalMonths = (ageYears * 12) + ageMonths;
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  const totalHeartbeats = totalDays * 24 * 60 * 75; // average 75 bpm
  const totalYearsSleeping = (ageYears * 0.33).toFixed(1);
  const dogYears = (ageYears * 7);

  if (statMonths) statMonths.textContent = totalMonths.toLocaleString();
  if (statWeeks) statWeeks.textContent = totalWeeks.toLocaleString();
  if (statDays) statDays.textContent = totalDays.toLocaleString();
  if (statHours) statHours.textContent = totalHours.toLocaleString();
  if (statSleep) statSleep.textContent = `${totalYearsSleeping} Yrs`;
  if (statDog) statDog.textContent = `${dogYears} Yrs`;
  if (statHeart) {
    if (totalHeartbeats >= 1e6) {
      statHeart.textContent = `${(totalHeartbeats / 1e6).toFixed(1)} Million`;
    } else {
      statHeart.textContent = totalHeartbeats.toLocaleString();
    }
  }
}

function copyAgeResult(btn) {
  const age = document.getElementById('age-output-val').textContent;
  const countdown = document.getElementById('birthday-countdown-val').textContent;
  const months = document.getElementById('stat-months').textContent;
  const weeks = document.getElementById('stat-weeks').textContent;
  const days = document.getElementById('stat-days').textContent;
  const text = `Age: ${age} | Countdown: ${countdown} | Milestones: ${months} Months, ${weeks} Weeks, ${days} Days`;
  window.copyToClipboard(text, btn);
}

window.calculateAge = calculateAge;
window.copyAgeResult = copyAgeResult;
