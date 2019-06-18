require('dotenv').config();

function getListingMap(userLocation, listingAddresses) {
  const latLongUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${userLocation.latitude},${userLocation.longitude}&markers=color:green|${userLocation.latitude},${userLocation.longitude}&markers=color:blue|${listingAddresses}&size=400x400&key=${process.env.MAPS_API_KEY}`;
  return latLongUrl;
}
