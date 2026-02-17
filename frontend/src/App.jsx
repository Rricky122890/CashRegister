import { useEffect, useMemo, useState } from "react";

const SAMPLE_INPUT = `2.12,3.00
1.97,2.00
3.33,5.00`;
const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";
const FALLBACK_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
];

function validateAmount(amountText, lineNumber) {
  const value = String(amountText).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    throw new Error(`Line ${lineNumber}: invalid amount "${amountText}"`);
  }

  return Number(value);
}

function convertInputToUsd(inputText, usdRate) {
  const lines = String(inputText).split(/\r?\n/);

  return lines
    .map((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      if (!trimmed) {
        return "";
      }

      const [owedRaw, paidRaw, ...extra] = trimmed.split(",");
      if (extra.length > 0 || !owedRaw || !paidRaw) {
        throw new Error(`Line ${lineNumber}: expected "owed,paid"`);
      }

      const owed = validateAmount(owedRaw, lineNumber);
      const paid = validateAmount(paidRaw, lineNumber);
      const owedUsd = (owed * usdRate).toFixed(2);
      const paidUsd = (paid * usdRate).toFixed(2);

      return `${owedUsd},${paidUsd}`;
    })
    .join("\n");
}

function App() {
  const [inputText, setInputText] = useState(SAMPLE_INPUT);
  const [convertedInputText, setConvertedInputText] = useState(SAMPLE_INPUT);
  const [results, setResults] = useState([]);
  const [outputText, setOutputText] = useState("");
  const [randomDivisor, setRandomDivisor] = useState(null);
  const [currencies, setCurrencies] = useState(FALLBACK_CURRENCIES);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [rateDate, setRateDate] = useState("");
  const [rateUsed, setRateUsed] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrencies() {
      try {
        const response = await fetch(`${FRANKFURTER_BASE_URL}/currencies`);
        const data = await response.json();
        if (!response.ok) {
          return;
        }

        const list = Object.entries(data).map(([code, name]) => ({
          code,
          name,
        }));
        list.sort((a, b) => a.code.localeCompare(b.code));
        if (!cancelled && list.length > 0) {
          setCurrencies(list);
        }
      } catch (_error) {
        // Keep fallback currency list if the request fails.
      }
    }

    loadCurrencies();
    return () => {
      cancelled = true;
    };
  }, []);

  const nonEmptyResultCount = useMemo(
    () => results.filter((entry) => entry.output !== "").length,
    [results],
  );

  async function getUsdRate(baseCurrency) {
    if (baseCurrency === "USD") {
      return { rate: 1, date: "live" };
    }

    const response = await fetch(
      `${FRANKFURTER_BASE_URL}/latest?base=${baseCurrency}&symbols=USD`,
    );
    const data = await response.json();
    if (!response.ok || !data?.rates?.USD) {
      throw new Error("Unable to fetch exchange rate");
    }

    return { rate: Number(data.rates.USD), date: data.date || "" };
  }

  async function handleProcess() {
    setLoading(true);
    setError("");

    try {
      const { rate, date } = await getUsdRate(fromCurrency);
      const usdInput =
        fromCurrency === "USD" ? inputText : convertInputToUsd(inputText, rate);

      const response = await fetch("/api/change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: usdInput }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setConvertedInputText(usdInput);
      setRateUsed(rate);
      setRateDate(date);
      setResults(data.results || []);
      setOutputText(data.outputText || "");
      setRandomDivisor(data.randomDivisor ?? null);
    } catch (requestError) {
      setResults([]);
      setOutputText("");
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileLoad(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

  const reader = new FileReader();
  reader.onload = () => {
      setInputText(String(reader.result || ""));
    };
    reader.readAsText(file);
  }

  return (
    <main className="layout">
      <section className="card">
        <h1>Cash Register</h1>
        <p>
          Enter one <code>owed,paid</code> pair per line. If change is divisible
          by <strong>{randomDivisor ?? 3}</strong>, denominations are
          randomized.
        </p>
        <p className="hint">
          Input currency is selected below, then converted to USD before
          calculating change.
        </p>

        <div className="row controls">
          <label htmlFor="from-currency">Customer currency</label>
          <select
            id="from-currency"
            value={fromCurrency}
            onChange={(event) => setFromCurrency(event.target.value)}
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
          <span className="to-usd">Converted to: USD</span>
        </div>

        <label htmlFor="flat-input">Flat file input</label>
        <textarea
          id="flat-input"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          rows={10}
          spellCheck={false}
        />

        <div className="row">
          <input type="file" accept=".txt,.csv" onChange={handleFileLoad} />
          <button type="button" onClick={handleProcess} disabled={loading}>
            {loading ? "Processing..." : "Process Change"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <h2>Output ({nonEmptyResultCount} lines)</h2>
        <p className="hint">
          Rate used: 1 {fromCurrency} = {rateUsed.toFixed(4)} USD
          {rateDate ? ` (date: ${rateDate})` : ""}
        </p>
        <pre className="output">
          {outputText || "Run processing to generate output."}
        </pre>
        <h3>Converted Input Sent To Backend (USD)</h3>
        <pre className="output">
          {convertedInputText || "No converted input yet."}
        </pre>

        {results.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Line</th>
                <th>Result</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.lineNumber}>
                  <td>{row.lineNumber}</td>
                  <td>{row.output || "(blank line)"}</td>
                  <td>{row.randomMode ? "Randomized" : "Minimum"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default App;
