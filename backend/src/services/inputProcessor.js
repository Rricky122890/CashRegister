const { amountToCents } = require('../utils/money');
const { calculateChangeBreakdown } = require('./changeCalculator');
const { formatBreakdown } = require('./changeFormatter');

function parseLine(line, lineNumber) {
  const trimmed = line.trim();

  if (!trimmed) {
    return {
      lineNumber,
      empty: true,
      output: ''
    };
  }

  const [owedRaw, paidRaw, ...extra] = trimmed.split(',');
  if (extra.length > 0 || !owedRaw || !paidRaw) {
    throw new Error(`Line ${lineNumber}: expected "owed,paid"`);
  }

  const owedCents = amountToCents(owedRaw);
  const paidCents = amountToCents(paidRaw);

  if (paidCents < owedCents) {
    throw new Error(`Line ${lineNumber}: paid amount is less than owed amount`);
  }

  return {
    lineNumber,
    owedCents,
    paidCents,
    changeCents: paidCents - owedCents,
    empty: false
  };
}

function processInput(inputText, denominations, options = {}) {
  const lines = String(inputText).split(/\r?\n/);
  const results = lines.map((line, index) => {
    const parsed = parseLine(line, index + 1);

    if (parsed.empty) {
      return parsed;
    }

    const breakdown = calculateChangeBreakdown(parsed.changeCents, denominations, options);
    const output = formatBreakdown(breakdown.counts, denominations);

    return {
      lineNumber: parsed.lineNumber,
      owedCents: parsed.owedCents,
      paidCents: parsed.paidCents,
      changeCents: parsed.changeCents,
      randomMode: breakdown.randomMode,
      output
    };
  });

  return {
    results,
    outputText: results.map((result) => result.output).join('\n')
  };
}

module.exports = {
  processInput
};
