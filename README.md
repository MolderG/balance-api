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

# withdraw from an existing account with enough balance
{"type":"withdraw","origin":"100","amount":5}
201 {"origin":{"id":"100","balance":5}}
# unknown account        -> 404 0
# insufficient balance   -> 422 {"error":"insufficient_funds"}

# transfer (creates the destination if needed)
{"type":"transfer","origin":"100","amount":15,"destination":"300"}
201 {"origin":{"id":"100","balance":0},"destination":{"id":"300","balance":15}}
# unknown origin         -> 404 0
# insufficient balance   -> 422 {"error":"insufficient_funds"}
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

- **Business logic is isolated from transport.** `Bank` has no knowledge of HTTP
  or JSON, so it is tested directly, without spinning up a server.
- **Operation outcomes are modelled explicitly.** `withdraw` and `transfer`
  return a tagged result (`ok` / `account_not_found` / `insufficient_funds`)
  instead of throwing for control flow. The HTTP layer maps each outcome to a
  status code.
- **Transfers are consistent.** The origin is only debited after the funds check
  passes, and the destination is only credited once the debit succeeded — a
  failed transfer leaves both accounts untouched.
- **Reads have no side effects.** `GET /balance` only reads.
- **`404` returns the body `0`** for unknown accounts because that is what the
  provided test suite expects. For the insufficient-funds case (which the suite
  does not cover) a structured `422` body was chosen instead.
- **No speculative features.** No auth, persistence layer or extra event types —
  only what the spec describes.

## Deploying

Any platform that runs a single long-lived process works. Because state is in
memory, do **not** use serverless / multi-instance setups — the `Map` would be
split across instances and reset between calls.
