const Listing = require('../models/Listing');
const moment = require('moment');

function archive() {
  const now = moment().format('MMMM Do YYYY, h:mm:ss a');
  return Listing
    .updateMany({ archived: false, expiration: { $lte: now } }, { archived: true });
}

module.exports = archive;
