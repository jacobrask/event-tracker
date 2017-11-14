const Geo = {};

Geo.geoip = (success, failure) => {
  // MaxMind GeoIP2 JavaScript API:
  if (typeof geoip2 !== 'undefined') {
    geoip2.city(results => {
      success({
        latitude: success.location.latitude,
        longitude: success.location.longitude
      });
    }, failure, {
      timeout: 2000,
      w3c_geolocation_disabled: true
    });
  }
};

export default Geo;
