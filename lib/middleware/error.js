//eslint-disable-next-line
module.exports = (err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message || err });
};
