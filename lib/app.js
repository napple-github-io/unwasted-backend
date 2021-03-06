const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/listings', require('./routes/listings'));
app.use('/api/v1/reviews', require('./routes/reviews'));

app.use(require('./middleware/notfound'));
app.use(require('./middleware/error'));

//eslint-disable-next-line
app.get('/', (req, res) => {
  res.end('Connected, no response');
});

module.exports = app;
