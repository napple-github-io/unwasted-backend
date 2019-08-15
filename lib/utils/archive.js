const Listing = require('../models/Listing');
const moment = require('moment');

function archive() {
  const now = moment().format('MMMM Do YYYY, h:mm:ss a');
  console.log(moment().add(2, 'days').format('YYYYMMDD'));
  return Listing
    .updateMany({ archived: false, expiration: { $lte: now } }, { archived: true });
}

module.exports = archive;
