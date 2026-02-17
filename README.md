# Cash Register

Cash register change calculator with:
- `backend` (Node.js + Express API + CLI file processor)
- `frontend` (React + Vite UI)

## Behavior
- Input format: one line per transaction, `owed,paid`
- Standard behavior: minimum number of denominations
- Twist behavior: if change owed (in cents) is divisible by `3`, denomination selection is randomized but total stays correct

Example input:

```txt
2.12,3.00
1.97,2.00
3.33,5.00
```

Example output:

```txt
3 quarters,1 dime,3 pennies
3 pennies
1 dollar,1 quarter,6 nickels,12 pennies
```

## Project Structure

```txt
CashRegister/
  backend/
    src/
      config/
      services/
      utils/
      server.js
      cli.js
    test/
  frontend/
    src/
```

## Backend

Install dependencies:

```bash
cd backend
npm install
```

Run API:

```bash
npm start
```

Backend endpoints:
- `GET /api/health`
- `GET /api/config`
- `POST /api/change` with JSON body `{ "input": "2.12,3.00\n1.97,2.00" }`

Run tests:

```bash
npm test
```

Process a flat file from CLI:

```bash
npm run process-file -- ./path/to/input.txt
```

## Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Run UI:

```bash
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:4000`.

## Extensibility Notes
- Random rule divisor is centralized in `backend/src/config/rules.js`.
- Denominations are centralized in `backend/src/config/denominations.js`.
- Additional special-case behaviors can be introduced in `backend/src/services/changeCalculator.js` as rule modules.
- Supporting a new currency/locale can be done by adding a denomination config and amount parser strategy.
