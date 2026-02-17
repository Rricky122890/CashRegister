const test = require('node:test');
const assert = require('node:assert/strict');

const { USD_DENOMINATIONS } = require('../src/config/denominations');
const { calculateMinimumChange, calculateChangeBreakdown } = require('../src/services/changeCalculator');
const { formatBreakdown } = require('../src/services/changeFormatter');
const { processInput } = require('../src/services/inputProcessor');

test('minimum change uses expected denominations for non-random amounts', () => {
  const counts = calculateMinimumChange(88, USD_DENOMINATIONS);
  const text = formatBreakdown(counts, USD_DENOMINATIONS);

  assert.equal(text, '3 quarters,1 dime,3 pennies');
});

test('random rule is enabled when change is divisible by 3', () => {
  const result = calculateChangeBreakdown(99, USD_DENOMINATIONS, { randomDivisor: 3 });

  assert.equal(result.randomMode, true);
});

test('input processor handles multi-line input', () => {
  const input = '2.12,3.00\n1.97,2.00';
  const output = processInput(input, USD_DENOMINATIONS, { randomDivisor: 97 });

  assert.equal(output.results.length, 2);
  assert.equal(output.results[0].output, '3 quarters,1 dime,3 pennies');
  assert.equal(output.results[1].output, '3 pennies');
});
