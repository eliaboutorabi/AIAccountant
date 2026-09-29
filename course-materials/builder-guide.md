# A small service you can inspect

This original teaching service connects the course's browser experiments to an actual Node.js HTTP server. It calculates a synthetic invoice balance, saves an operation receipt, handles concurrent retries, survives a process restart and streams recorded events using Server-Sent Events (SSE).

There is no model, OCR request, database service, API key, real customer, posting or payment. The source is short enough to trace before running it. The service listens only on your own computer at 127.0.0.1:8787. It intentionally has no user authentication and is not a production deployment template.

## Run and verify

1. Install Node.js 24 or later from https://nodejs.org/en/download.
2. Save `builder-service.mjs` and this guide in a new practice folder.
3. Open a terminal in that folder and run:

```sh
node builder-service.mjs --self-test
node builder-service.mjs
```

The self-test creates a temporary directory, starts a loopback server on an available port, executes real HTTP requests, checks expected results and cleans up its own temporary files. It checks exact amounts, duplicate payment identities, concurrent duplicate requests, changed payload conflicts, invalid decimals, restart recovery and event replay.

Normal execution saves `.builder-service/state.json` in the folder where you run it. Keep a copy of this file as your experiment evidence. Stop the service with Ctrl+C. Starting it again in the same folder restores the stored receipts.

## Follow one request

In a second terminal:

```sh
curl http://127.0.0.1:8787/api/sample
curl -X POST http://127.0.0.1:8787/api/reconcile \
  -H 'Content-Type: application/json' \
  -d '{"operationId":"reconcile-001","invoiceId":"INV-0012","amount":"300.00","payments":[{"id":"P1","amount":"80.00"},{"id":"P2","amount":"40.00"},{"id":"P2","amount":"40.00"}]}'
curl http://127.0.0.1:8787/api/operations/reconcile-001
```

Predict before running: the invoice is 30,000 USD cents. Unique payments total 12,000 cents. Outstanding is 18,000 cents, or USD 180. The repeated P2 is retained in the duplicate list but is not counted twice. The initial result has revision 1 when this is the first committed request in a fresh practice folder.

The path through the code is `readBody` → `validate` → the serialized transaction → `reconcile` → write/rename state → send the HTTP response. `cents` converts decimal strings directly to BigInt minor units. The response turns BigInts into strings because ordinary JSON has no BigInt type.

Repeat the identical POST. The service returns the existing receipt with `replayed: true`; it does not create a new revision. Change the invoice amount but reuse the operation identity: the service returns HTTP 409. An operation identity cannot quietly change its meaning.

## Observe delivery separately from state

In another terminal:

```sh
curl -N 'http://127.0.0.1:8787/api/events?after=0'
```

SSE carries server-to-client event records over an HTTP response. The blank line ends an event; `id:` provides a replay cursor; the JSON data identifies a committed receipt. POST remains the command channel. This is different from bidirectional WebSocket messaging or WebRTC audio media.

Create another operation using a new identity, then disconnect the stream. Reconnect with the last event ID:

```sh
curl -N -H 'Last-Event-ID: 1' http://127.0.0.1:8787/api/events
```

The service retains the latest 100 events. If your cursor is older than that window, it emits `resync`; inspect operation status instead of pretending that an incomplete replay is complete. A missing response or disconnected stream does not prove that the underlying operation failed.

## Three implementation exercises

### 1. Contract and numeric evidence

Try a payment amount of `1.234`, a numeric JSON amount instead of a string, and the same payment ID with different amounts. Record the HTTP status, error code and whether storage changed. Explain why an identifier such as `INV-0012` must not be converted to a number.

Then propose a credit-note extension. Do not simply allow negative signs everywhere: state which fields can be negative and how the financial meaning, validation, examples and tests change.

### 2. Recovery and concurrency

Send the same operation twice concurrently, using two terminals. Inspect the same returned revision and the persisted receipt. Stop and restart the process, then repeat the request. Explain which evidence proves result reuse and which does not establish a general exactly-once guarantee.

The in-memory promise queue serializes writes only inside this one process. Running two processes against the same file is outside its contract. A deployed service needs a database transaction, an appropriate unique key and isolation, plus ownership checks and a strategy for external effects. Atomic file rename is not a complete power-loss or distributed durability design.

### 3. Add a provider adapter without surrendering authority

Sketch an adapter that would turn a model's proposal into the same validated request. Keep provider credentials on a trusted server and preserve the difference between model `call_id`, application operation identity and a delivery event ID. Do not add real credentials to this downloaded example.

Specify a fake adapter with known malformed arguments, an unauthorized request, a delayed response and a duplicate call. Test the dispatcher before considering paid inference. A schema-valid proposal is still not authorized business execution.

## Builder defense checklist

- Show the contract and an independent expected USD-cent result.
- Point to the exact code that enforces each rule.
- Demonstrate one invalid request, one conflicting identity and one retry after restart.
- Explain the distinction between a durable receipt and a delivered event.
- State where authentication, per-user authorization, transactional storage, quotas, versioned migrations, secrets, monitoring and safe deployment would be added.
- Keep source, commands, observed outputs and a failure-and-repair note together. A generated summary is not evidence that the code ran.

Use this with M26, M30, M34 and M35. Coding agents can help implement a change; your job is to define its behavior, inspect the diff and challenge its assumptions.
