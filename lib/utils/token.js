const jwt = require('jsonwebtoken');
const EXPIRES_IN = '24h';

const tokenize = payload => {
  return jwt.sign({ payload }, process.env.AUTH_SECRET, { expiresIn: EXPIRES_IN });
};

const untokenize = token => {
  return jwt.verify(token, process.env.AUTH_SECRET).payload;
};

module.exports = { tokenize, untokenize };
