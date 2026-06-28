# Balance & Event API

A small HTTP API with two operations — query a balance and apply an event
(deposit, withdraw, transfer). State is kept in memory; durability is not a
requirement.

## Running locally

```bash
npm install
npm run dev          # starts on PORT (default 3000)
```

Production build:

```bash
npm run build
npm start
```

Tests:

```bash
npm test
```

## API

| Method | Path                       | Behaviour                                      |
| ------ | -------------------------- | ---------------------------------------------- |
| POST   | `/reset`                   | Clears all state. `200 OK`.                    |
| GET    | `/balance?account_id=<id>` | `200 <balance>`, or `404 0` if unknown.        |
| POST   | `/event`                   | Applies a `deposit`, `withdraw` or `transfer`. |

Event bodies and responses:

```
# deposit (creates the account if needed)
{"type":"deposit","destination":"100","amount":10}
201 {"destination":{"id":"100","balance":10}}

# withdraw from an existing account
{"type":"withdraw","origin":"100","amount":5}
201 {"origin":{"id":"100","balance":5}}
# from an unknown account -> 404 0

# transfer (creates the destination if needed)
{"type":"transfer","origin":"100","amount":15,"destination":"300"}
201 {"origin":{"id":"100","balance":0},"destination":{"id":"300","balance":15}}
# from an unknown origin -> 404 0
```

## Structure

```
src/
  domain/bank.ts   business logic — accounts, deposit/withdraw/transfer. No HTTP.
  http/app.ts      Express app — parses requests, calls the domain, maps results.
  server.ts        composition root — wires the Bank into the app and listens.
test/bank.test.ts  unit tests for the domain.
```

## Design decisions

- **Business logic is isolated from transport.** `Bank` has no knowledge of
  HTTP or JSON, so it is tested directly, without spinning up a server.
- **One storage seam.** The in-memory `Map` lives behind `Bank`. Adding real
  persistence later means changing that one class and nothing else.
- **No speculative features.** No auth, validation, logging framework or extra
  event types — only what the spec describes. The code stays small and easy to
  change on request.

## Deploying

Any platform that runs a single long-lived process works. Because state is in
memory, do **not** use serverless / multi-instance setups — the `Map` would be
split across instances and reset between calls.

With Docker:

```bash
docker build -t balance-api .
docker run -p 3000:3000 -e PORT=3000 balance-api
```
