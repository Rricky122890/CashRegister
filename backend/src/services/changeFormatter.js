function formatBreakdown(counts, denominations) {
  const pieces = [];

  for (const denomination of denominations) {
    const quantity = counts.get(denomination.value);
    if (!quantity) {
      continue;
    }

    const label = quantity === 1 ? denomination.singular : denomination.plural;
    pieces.push(`${quantity} ${label}`);
  }

  return pieces.length === 0 ? 'no change' : pieces.join(',');
}

module.exports = {
  formatBreakdown
};
