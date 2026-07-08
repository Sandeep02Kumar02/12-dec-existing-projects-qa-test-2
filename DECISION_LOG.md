# Decision Log

This log documents the decision to introduce the Express.js framework into the `hello_world` project and to add a new `GET /good-evening` endpoint returning `Good evening`, while preserving the existing universal `Hello, World!` behavior. It satisfies the **Explainability** rule by serving as the single source of truth for every non-trivial decision behind this change, keeping rationale out of code comments.

## Decision Log

| ID | Decision | Alternatives Considered | Rationale | Risks / Mitigation |
|----|----------|-------------------------|-----------|--------------------|
| D1 | Refactor the single `server.js` into one Express app hosting both routes | Run a second server on another port; branch on `req.url` with raw `http` (no Express); mount Express under `http` | Single app on `127.0.0.1:3000` preserves the existing bind; the user explicitly mandated Express; most idiomatic and minimal | Express adds default `X-Powered-By`/`ETag` headers (additive, non-breaking); body/status/content-type are preserved explicitly |
| D2 | Use `express@^5.2.1` (current `latest`) | `express@4.22.2` (`latest-4`) | Default `npm install express` resolution; Node v20.20.2 satisfies `engines >= 18`; greenfield with no v4 legacy | Express 5 changed routing (path-to-regexp v8); mitigated by the pathless catch-all (D3) |
| D3 | Implement the Hello World catch-all as a pathless `app.use(...)` | Bind Hello World only to `/` (other paths regress to 404); named wildcard `app.all('/{*splat}', ...)` | Preserves the current universal Hello World behavior; avoids the Express 5 bare-`*` startup crash | Slightly less RESTful than explicit routes; acceptable for a tutorial fixture |
| D4 | Name the new route `GET /good-evening` | `/evening`, `/goodevening`, `/good_evening` | Human-readable kebab-case; the user did not specify a path | If a downstream consumer expects a specific path, it may mismatch — flagged for confirmation |
| D5 | Preserve the exact Hello World contract: `text/plain` + `Hello, World!\n` + 200 | Use `res.send()` defaults (`text/html` for strings) | Maintains the existing observable contract | Express adds `X-Powered-By`/`ETag`; optional `app.disable('x-powered-by')` hardening if a byte-identical header set is required |
| D6 | Return the exact literal `Good evening` for the new route | Append a trailing newline (`Good evening\n`) to match the Hello route style | Fidelity to the user's exact string | The trailing-newline choice is minor; flagged — a newline may be added for consistency if desired |
| D7 | Do not add a test framework or test files | Add Jest/Mocha with unit/integration tests | "Make minimal changes"; tests were not requested; the existing `test` script is a deliberate failing placeholder | No automated regression net; mitigated by documented manual `curl` validation (below) |
| D8 | Leave `README.md` and `package.json` `main` unchanged | Document the new endpoint in README; fix `main` to `server.js` | README says "Do not touch!"; the `main`→`index.js` discrepancy is pre-existing and unrelated | Documentation slightly stale; explicitly out of scope |
| D9 | Place the decision log in `DECISION_LOG.md` at the repo root | A `docs/` subdirectory; inline code comments | The rule requires a delivered Markdown single source of truth; no `docs/` convention exists; code-comment rationale is forbidden | Adds a file to a "do not touch" repo; rule-mandated and additive |
| D10 | Serve `Good evening` only for an exact `GET /good-evening` via a guarded terminal middleware (`req.method === 'GET' && req.path === '/good-evening'`); every other request — other methods, other paths, case variants, trailing-slash variants, and `HEAD /good-evening` — falls through to the Hello World catch-all | Vanilla `app.get('/good-evening', ...)` (Express defaults are case-insensitive + non-strict and auto-map HEAD onto the GET handler); `app.set('case sensitive routing', true)` + `app.set('strict routing', true)` (still does not stop the automatic HEAD mapping) | Enforces backward compatibility (R3): every request the original raw-`http` server answered with `Hello, World!\n` still does. Vanilla `app.get` regressed `HEAD /good-evening` (auto-HEAD emitted the 12-byte Good-evening headers instead of the 14-byte Hello World ones) and `/GOOD-EVENING`, `/Good-Evening`, `/good-evening/` (case-insensitive / non-strict routing) to `Good evening` | `req.path` excludes the query string, so `/good-evening?x=1` still returns the greeting; the guard matches only the exact route; Express-5-safe (no wildcard pattern) |

## Traceability Matrix

Bidirectional traceability matrix (`server.js` raw `http` source → Express target).

| # | Source construct (`server.js`, raw `http`) | Target implementation (Express) |
|---|---------------------------------------------|----------------------------------|
| 1 | `require('http')` (server.js:L1) | `require('express')` (http used internally by Express; explicit import removed) |
| 2 | `hostname = '127.0.0.1'` (server.js:L3) | Unchanged; passed to `app.listen` |
| 3 | `port = 3000` (server.js:L4) | Unchanged; passed to `app.listen` |
| 4 | `http.createServer(cb)` (server.js:L6) | `const app = express()` |
| 5 | `res.statusCode = 200` (server.js:L7) | Implicit 200 via `res.send()` on all handlers |
| 6 | `res.setHeader('Content-Type', 'text/plain')` (server.js:L8) | `res.type('text/plain')` |
| 7 | `res.end('Hello, World!\n')` (server.js:L9) | Pathless catch-all `app.use` → `res.send('Hello, World!\n')` |
| 8 | *(no source — new feature R2)* | Exact-match guard `app.use` (`req.method === 'GET' && req.path === '/good-evening'`) → `res.type('text/plain').send('Good evening')` |
| 9 | `server.listen(port, hostname, cb)` + `console.log` (server.js:L12-L14) | `app.listen(port, hostname, cb)` + identical `console.log` |

## Coverage Statement

Every source construct in `server.js` (lines 1–14) maps to a target implementation (rows 1–7 and 9), achieving **100% source coverage**. In the reverse direction, every target maps back to a source construct except row 8 (`GET /good-evening`), which is the intentional additive feature (requirement R2) and has no antecedent by design.

## Validation Criteria

Manual validation only; no test framework is added (per D7):

- [ ] `node server.js` logs `Server running at http://127.0.0.1:3000/`.
- [ ] `curl 127.0.0.1:3000/` returns 200, `text/plain`, `Hello, World!`.
- [ ] `curl 127.0.0.1:3000/good-evening` returns 200, `text/plain`, `Good evening`.
- [ ] `curl 127.0.0.1:3000/anything` returns 200, `Hello, World!` (catch-all behavior preserved).
- [ ] `curl -I 127.0.0.1:3000/good-evening` (HEAD) returns 200 with `Content-Length: 14` — HEAD falls through to the Hello World catch-all; only an exact `GET /good-evening` returns the 12-byte greeting.
- [ ] `curl 127.0.0.1:3000/GOOD-EVENING` and `curl 127.0.0.1:3000/good-evening/` return 200, `text/plain`, `Hello, World!` — case and trailing-slash variants preserve the universal catch-all (backward compatibility).
