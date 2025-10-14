const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = (service, validator) => {
  const albumsHandler = new AlbumsHandler(service, validator);
  return routes(albumsHandler);
};