const express = require('express');
const cors = require('cors');

const { USD_DENOMINATIONS } = require('./config/denominations');
const { RULES } = require('./config/rules');
const { processInput } = require('./services/inputProcessor');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/config', (_req, res) => {
  res.json({
    randomDivisor: RULES.randomDivisor,
    denominations: USD_DENOMINATIONS
  });
});

app.post('/api/change', (req, res) => {
  const { input } = req.body || {};

  if (typeof input !== 'string') {
    return res.status(400).json({
      error: 'Request body must include an input string'
    });
  }

  try {
    const processed = processInput(input, USD_DENOMINATIONS, {
      randomDivisor: RULES.randomDivisor
    });

    return res.json({
      ...processed,
      randomDivisor: RULES.randomDivisor
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Cash register API listening on port ${port}`);
});
