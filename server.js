/**
 * @fileoverview Minimal single-file Node.js HTTP server that returns a fixed
 * plain-text "Hello, World!" greeting for every incoming request, regardless of
 * HTTP method or URL path. Runnable entry point of the hao-backprop-test
 * project; depends only on the Node.js built-in `http` module.
 * @see https://nodejs.org/api/http.html
 */

const http = require('http');

/**
 * Loopback host the server binds to; `127.0.0.1` restricts access to the local
 * machine only.
 * @constant {string}
 */
const hostname = '127.0.0.1';

/**
 * TCP port the server listens on.
 * @constant {number}
 */
const port = 3000;

/**
 * Handles every incoming HTTP request with a fixed plain-text greeting. The
 * request is not inspected; all methods and paths receive `200 OK` and
 * `Content-Type: text/plain` with body `Hello, World!\n` (HEAD omits the body).
 *
 * @param {http.IncomingMessage} req - Incoming HTTP request (not inspected).
 * @param {http.ServerResponse} res - HTTP response used to send the greeting.
 * @returns {void}
 * @example
 * // $ curl http://127.0.0.1:3000/
 * // Hello, World!
 */
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

/**
 * Starts listening on the configured port/hostname and logs the startup URL
 * once the server is ready to accept connections.
 *
 * @returns {void}
 * @example
 * // Console output on successful startup:
 * // Server running at http://127.0.0.1:3000/
 */
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
