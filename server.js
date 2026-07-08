const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.use((req, res, next) => {
  if (req.method === 'GET' && req.path === '/good-evening') {
    res.type('text/plain').send('Good evening');
    return;
  }
  next();
});

app.use((req, res) => {
  res.type('text/plain').send('Hello, World!\n');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
