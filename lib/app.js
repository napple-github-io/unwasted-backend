const express = require('express');
const app = express();
// const { bearerToken } = require('../lib/middleware/ensureAuth');

app.use(express.json());
// app.use(bearerToken);

app.use('/api/v1/auth', require('./routes/auth'));
// app.use('/api/v1/reviews', require('./routes/reviews'));
// app.use('/api/v1/listings', require('./routes/listings'));

app.use(require('./middleware/notfound'));
app.use(require('./middleware/error'));

//eslint-disable-next-line
app.get('/', (req, res) => {
  res.end('Connected, no response');
});

module.exports = app;
