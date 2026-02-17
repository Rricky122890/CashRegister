function amountToCents(amountText) {
  const normalized = String(amountText).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Invalid currency amount: "${amountText}"`);
  }

  const [wholePart, decimalPart = ''] = normalized.split('.');
  const centsPart = (decimalPart + '00').slice(0, 2);

  return Number(wholePart) * 100 + Number(centsPart);
}

function centsToDisplay(cents) {
  return (cents / 100).toFixed(2);
}

module.exports = {
  amountToCents,
  centsToDisplay
};
