const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.get('/good-evening', (req, res) => {
  res.type('text/plain').send('Good evening');
});

app.use((req, res) => {
  res.type('text/plain').send('Hello, World!\n');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
