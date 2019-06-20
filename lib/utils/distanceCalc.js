const request = require('superagent');

const getDistanceString = (userLoc, destination) => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${userLoc}&destinations=${destination}&key=${process.env.MAPS_API_KEY}`;
  return request
    .get(url)
    .then(res => res.body)
    .then(result => result.rows[0].elements[0].distance.text);
};

const getDistanceNumber = (origin, listing) => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${listing.location.street}&key=${process.env.MAPS_API_KEY}`;
  return request
    .get(url)
    .then(res => res.body)
    .then(result => result.rows[0].elements[0].distance.text)
    .then(dist => {
      const calc = parseInt(dist.replace(/,/g, ''), 10);
      return { ...listing, distance: calc };
    });
};

module.exports = {
  getDistanceString,
  getDistanceNumber,
};
