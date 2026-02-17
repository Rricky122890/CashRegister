const fs = require('fs');
const path = require('path');

const { USD_DENOMINATIONS } = require('./config/denominations');
const { RULES } = require('./config/rules');
const { processInput } = require('./services/inputProcessor');

function run() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    // eslint-disable-next-line no-console
    console.error('Usage: node src/cli.js <path-to-input-file>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), inputPath);
  const inputText = fs.readFileSync(resolvedPath, 'utf8');
  const { outputText } = processInput(inputText, USD_DENOMINATIONS, {
    randomDivisor: RULES.randomDivisor
  });

  // eslint-disable-next-line no-console
  console.log(outputText);
}

run();
