const SongsHandler = require('./handler');
const routes = require('./routes');

module.exports = (service, validator) => {
  const songsHandler = new SongsHandler(service, validator);
  return routes(songsHandler);
};