const { RULES } = require('../config/rules');

function isRandomCase(changeCents, randomDivisor = RULES.randomDivisor) {
  if (changeCents <= 0) {
    return false;
  }

  return changeCents % randomDivisor === 0;
}

function calculateMinimumChange(changeCents, denominations) {
  let remaining = changeCents;
  const counts = new Map();

  for (const denomination of denominations) {
    if (remaining === 0) {
      break;
    }

    const quantity = Math.floor(remaining / denomination.value);
    if (quantity > 0) {
      counts.set(denomination.value, quantity);
      remaining -= quantity * denomination.value;
    }
  }

  return counts;
}

function calculateRandomChange(changeCents, denominations) {
  let remaining = changeCents;
  const counts = new Map();

  while (remaining > 0) {
    const eligible = denominations.filter((denomination) => denomination.value <= remaining);
    const randomIndex = Math.floor(Math.random() * eligible.length);
    const selected = eligible[randomIndex];

    counts.set(selected.value, (counts.get(selected.value) || 0) + 1);
    remaining -= selected.value;
  }

  return counts;
}

function calculateChangeBreakdown(changeCents, denominations, options = {}) {
  const randomDivisor = options.randomDivisor || RULES.randomDivisor;
  const randomMode = isRandomCase(changeCents, randomDivisor);
  const counts = randomMode
    ? calculateRandomChange(changeCents, denominations)
    : calculateMinimumChange(changeCents, denominations);

  return {
    randomMode,
    counts
  };
}

module.exports = {
  isRandomCase,
  calculateMinimumChange,
  calculateRandomChange,
  calculateChangeBreakdown
};
